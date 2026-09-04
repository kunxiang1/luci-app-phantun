'use strict';
'require view';
'require form';
'require rpc';
'require ui';
'require uci';
'require tools.widgets as widgets';

var callInitAction = rpc.declare({
	object: 'rc',
	method: 'init',
	params: [ 'name', 'action' ],
	expect: { result: true }
});

var callServiceStatus = rpc.declare({
	object: 'rc',
	method: 'status',
	params: [ 'name' ],
	expect: { running: false }
});

function validateHostPort(sid, val) {
	if (!val || val.match(/^\s*$/))
		return _('This field is required');
	var m = val.match(/^(\[[0-9A-Fa-f:.%]+\]|[^:\s\[\]]+):(\d{1,5})$/);
	if (!m)
		return _('Expected format: IP:PORT, [IPv6]:PORT or HOST:PORT (e.g. 127.0.0.1:1234, [::1]:4567, example.com:4567)');
	var port = parseInt(m[2], 10);
	if (port < 1 || port > 65535)
		return _('Port must be between 1 and 65535');
	return true;
}

function validatePort(sid, val) {
	if (!val || !val.match(/^\d{1,5}$/))
		return _('Expected a single port number (1-65535)');
	var port = parseInt(val, 10);
	if (port < 1 || port > 65535)
		return _('Port must be between 1 and 65535');
	return true;
}

function validateIfaceName(sid, val) {
	if (!val || val.match(/^\s*$/))
		return true;
	if (!val.match(/^[A-Za-z0-9_.:-]+$/))
		return _('Only letters, digits and the characters _ . - : are allowed');
	return true;
}

function validateFilePath(sid, val) {
	if (!val || val.match(/^\s*$/))
		return true;
	if (!val.match(/^\//))
		return _('Please enter an absolute path, e.g. /etc/phantun/handshake.bin');
	return true;
}

return view.extend({
	running: false,

	handleRestart: function() {
		return callInitAction('phantun', 'restart')
			.then(L.bind(function() {
				ui.addNotification(null, E('p', _('Phantun service restarted.')), 'info');
				return callServiceStatus('phantun');
			}, this))
			.then(L.bind(function(st) {
				this.running = st.running;
			}, this));
	},

	render: function() {
		var m, s, o;

		return Promise.all([
			L.resolveDefault(callServiceStatus('phantun'), {}),
			uci.load('phantun')
		]).then(L.bind(function(res) {
			this.running = res[0].running;

			m = new form.Map('phantun', _('Phantun'),
				_('Phantun is a lightweight and fast UDP to TCP obfuscator. ' +
				  'It obfuscates UDP packets into fake TCP streams so that they can pass through ' +
				  'stateful firewalls/NATs which block or throttle UDP traffic. ' +
				  'Configure client instances on the router itself or on remote servers below. ' +
				  'See <a href="https://github.com/dndx/phantun">github.com/dndx/phantun</a> for details.'));
			m.tabbed = true;

			/* ---- status / control ---- */
			s = m.section(form.NamedSection, 'global', 'global', _('Service Status'));
			s.addremove = false;
			s.anonymous = true;
			s.tab('status', _('Status'));

			o = s.taboption('status', form.DummyValue, '_state', _('Daemon'));
			o.cfgvalue = L.bind(function() {
				return this.running ? _('Running') : _('Not running');
			}, this);

			o = s.taboption('status', form.DummyValue, '_instances', _('Configured instances'));
			o.cfgvalue = function() {
				var c = uci.get('phantun', 'client') || {};
				var sv = uci.get('phantun', 'server') || {};
				var nc = 0, ns = 0;
				Object.keys(c).forEach(function(k) { if (c[k]['.type'] === 'client') nc++; });
				Object.keys(sv).forEach(function(k) { if (sv[k]['.type'] === 'server') ns++; });
				return '%s: %d, %s: %d'.format(_('Clients'), nc, _('Servers'), ns);
			};

			o = s.taboption('status', form.DummyValue, '_hint');
			o.rawhtml = true;
			o.cfgvalue = function() {
				return _('Remember to enable Kernel IP forwarding (net.ipv4.ip_forward=1) and to make sure both ends run the same Phantun version.');
			};

			o = s.taboption('status', form.Button, '_restart');
			o.title = _('Restart Phantun');
			o.inputtitle = _('Restart');
			o.inputstyle = 'apply';
			o.onclick = L.bind(this.handleRestart, this);

			/* ---- client instances ---- */
			s = m.section(form.TypedSection, 'client', _('Clients'),
				_('The client listens for plain UDP packets on its local address and forwards them ' +
				  'through the Phantun server. Traffic from the LAN reaching the router must be routed ' +
				  'into the TUN interface (policy routing or DNAT), and SNAT/MASQUERADE on the WAN ' +
				  'interface is required — enable "Auto firewall rules" per instance to insert it automatically.'));
			s.anonymous = false;
			s.addremove = true;

			o = s.option(form.Flag, 'enabled', _('Enabled'),
				_('Start this instance when the service starts'));

			o = s.option(form.Value, 'local', _('UDP listen address (--local)'),
				_('IP and port where this client listens for incoming UDP datagrams, e.g. 0.0.0.0:1234. IPv6 must be written as [IPv6]:PORT'));
			o.validate = validateHostPort;
			o.placeholder = '0.0.0.0:1234';
			o.rmempty = false;

			o = s.option(form.Value, 'remote', _('Phantun server (--remote)'),
				_('Address or host name and port of the Phantun server to connect to, e.g. 10.0.0.1:4567 or example.com:4567. IPv6 must be written as [IPv6]:PORT'));
			o.validate = validateHostPort;
			o.rmempty = false;

			o = s.option(form.Value, 'tun', _('TUN interface name (--tun)'),
				_('Name of the TUN interface created by Phantun. Leave empty to let the kernel pick the next available name.'));
			o.validate = validateIfaceName;
			o.placeholder = 'phantun0';

			o = s.option(form.Value, 'tun_local', _('TUN IPv4 local address (--tun-local)'),
				_('IPv4 address assigned to the TUN interface (the O/S end)'));
			o.datatype = 'ip4addr';
			o.placeholder = '192.168.200.1';
			o.rmempty = false;

			o = s.option(form.Value, 'tun_peer', _('TUN IPv4 peer address (--tun-peer)'),
				_('IPv4 destination (peer) address of the TUN interface (the Phantun client end). SNAT/MASQUERADE is required on the Internet facing interface.'));
			o.datatype = 'ip4addr';
			o.placeholder = '192.168.200.2';
			o.rmempty = false;

			o = s.option(form.Flag, 'ipv4_only', _('IPv4 only (-4)'),
				_('Only use IPv4 when connecting to the remote and do not assign IPv6 addresses to the TUN interface'));

			o = s.option(form.Value, 'tun_local6', _('TUN IPv6 local address (--tun-local6)'),
				_('IPv6 address assigned to the TUN interface (the O/S end)'));
			o.depends('ipv4_only', '0');
			o.datatype = 'ip6addr';
			o.placeholder = 'fcc8::1';

			o = s.option(form.Value, 'tun_peer6', _('TUN IPv6 peer address (--tun-peer6)'),
				_('IPv6 destination (peer) address of the TUN interface (the Phantun client end)'));
			o.depends('ipv4_only', '0');
			o.datatype = 'ip6addr';
			o.placeholder = 'fcc8::2';

			o = s.option(form.Value, 'handshake_packet', _('Handshake packet file (--handshake-packet)'),
				_('Optional path to a file whose content is sent as the first data packet to the server after the TCP handshake. The file must not exceed the MTU of the outgoing interface; it is always sent in a single packet.'));
			o.validate = validateFilePath;
			o.placeholder = '/etc/phantun/handshake.bin';

			o = s.option(form.ListValue, 'loglevel', _('Log verbosity (RUST_LOG)'),
				_('Logging level passed to the daemon via the RUST_LOG environment variable'));
			o.value('off', _('Off'));
			o.value('error', _('Error'));
			o.value('warn', _('Warning'));
			o.value('info', _('Info'));
			o.value('debug', _('Debug'));
			o.value('trace', _('Trace'));
			o.default = 'info';

			o = s.option(form.Flag, 'firewall', _('Auto firewall rules'),
				_('Automatically insert nftables (fw4) rules for this instance: MASQUERADE traffic leaving the TUN interface towards the WAN'));
			o.default = '0';

			o = s.option(widgets.NetworkSelect, 'network', _('Overlying network'),
				_('Firewall zone / interface used as the outgoing (WAN) network for the masquerade rule'));
			o.depends('firewall', '1');
			o.nocreate = true;
			o.default = 'wan';

			/* ---- server instances ---- */
			s = m.section(form.TypedSection, 'server', _('Servers'),
				_('The server listens for Phantun client connections on a TCP port and forwards the ' +
				  'de-obfuscated UDP packets to the target UDP server. Incoming TCP traffic must be ' +
				  'DNAT-ed to the TUN peer address — enable "Auto firewall rules" per instance to insert it automatically.'));
			s.anonymous = false;
			s.addremove = true;

			o = s.option(form.Flag, 'enabled', _('Enabled'),
				_('Start this instance when the service starts'));

			o = s.option(form.Value, 'local', _('TCP listen port (--local)'),
				_('Port on which this server listens for incoming Phantun client (fake TCP) connections, e.g. 4567'));
			o.validate = validatePort;
			o.placeholder = '4567';
			o.rmempty = false;

			o = s.option(form.Value, 'remote', _('UDP target (--remote)'),
				_('Address or host name and port this server forwards UDP packets to, e.g. 127.0.0.1:1234 or example.com:1234. IPv6 must be written as [IPv6]:PORT'));
			o.validate = validateHostPort;
			o.rmempty = false;

			o = s.option(form.Value, 'tun', _('TUN interface name (--tun)'),
				_('Name of the TUN interface created by Phantun. Leave empty to let the kernel pick the next available name.'));
			o.validate = validateIfaceName;
			o.placeholder = 'phantun1';

			o = s.option(form.Value, 'tun_local', _('TUN IPv4 local address (--tun-local)'),
				_('IPv4 address assigned to the TUN interface (the O/S end)'));
			o.datatype = 'ip4addr';
			o.placeholder = '192.168.201.1';
			o.rmempty = false;

			o = s.option(form.Value, 'tun_peer', _('TUN IPv4 peer address (--tun-peer)'),
				_('IPv4 destination (peer) address of the TUN interface (the Phantun server end). DNAT rules must redirect incoming traffic to this address.'));
			o.datatype = 'ip4addr';
			o.placeholder = '192.168.201.2';
			o.rmempty = false;

			o = s.option(form.Flag, 'ipv4_only', _('IPv4 only (-4)'),
				_('Do not assign IPv6 addresses to the TUN interface'));

			o = s.option(form.Value, 'tun_local6', _('TUN IPv6 local address (--tun-local6)'),
				_('IPv6 address assigned to the TUN interface (the O/S end)'));
			o.depends('ipv4_only', '0');
			o.datatype = 'ip6addr';
			o.placeholder = 'fcc9::1';

			o = s.option(form.Value, 'tun_peer6', _('TUN IPv6 peer address (--tun-peer6)'),
				_('IPv6 destination (peer) address of the TUN interface (the Phantun server end)'));
			o.depends('ipv4_only', '0');
			o.datatype = 'ip6addr';
			o.placeholder = 'fcc9::2';

			o = s.option(form.Value, 'handshake_packet', _('Handshake packet file (--handshake-packet)'),
				_('Optional path to a file whose content is sent as the first data packet to the client after the TCP handshake. The file must not exceed the MTU of the outgoing interface; it is always sent in a single packet.'));
			o.validate = validateFilePath;
			o.placeholder = '/etc/phantun/handshake.bin';

			o = s.option(form.ListValue, 'loglevel', _('Log verbosity (RUST_LOG)'),
				_('Logging level passed to the daemon via the RUST_LOG environment variable'));
			o.value('off', _('Off'));
			o.value('error', _('Error'));
			o.value('warn', _('Warning'));
			o.value('info', _('Info'));
			o.value('debug', _('Debug'));
			o.value('trace', _('Trace'));
			o.default = 'info';

			o = s.option(form.Flag, 'firewall', _('Auto firewall rules'),
				_('Automatically insert nftables (fw4) rules for this instance: DNAT incoming TCP traffic on the listen port to the TUN peer address'));
			o.default = '0';

			o = s.option(widgets.NetworkSelect, 'network', _('Overlying network'),
				_('Firewall zone / interface on which the DNAT rule matches incoming traffic'));
			o.depends('firewall', '1');
			o.nocreate = true;
			o.default = 'wan';

			return m.render();
		}, this));
	}
});
