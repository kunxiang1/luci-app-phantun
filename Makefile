#
# luci-app-phantun - LuCI support for Phantun (https://github.com/dndx/phantun)
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for Phantun
LUCI_DESCRIPTION:=Web interface for Phantun, a lightweight and fast UDP to TCP obfuscator (client & server).
LUCI_DEPENDS:=+phantun-client +phantun-server
LUCI_PKGARCH:=all

PKG_VERSION:=1.0.0
PKG_RELEASE:=1

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
