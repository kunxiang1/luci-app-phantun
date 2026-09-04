#
# phantun - A lightweight and fast UDP to TCP obfuscator
# https://github.com/dndx/phantun
#
# Based on https://github.com/hizukiayaka/phantun-openwrt, updated to
# build upstream dndx/phantun v0.8.1 and extended init script.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=phantun
PKG_VERSION:=0.8.1
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/dndx/phantun.git
PKG_SOURCE_VERSION:=b42ed821472b78866a36e18d315de695b84e7887
PKG_MIRROR_HASH:=skip
PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)

PKG_BUILD_DIR:=$(BUILD_DIR)/phantun-$(PKG_VERSION)
PKG_BUILD_DEPENDS:=rust/host
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
# When placed under feeds/packages/net/phantun this is:
#   include ../../lang/rust/rust-package.mk
# Adjust the relative path if you put this package elsewhere.
include $(TOPDIR)/../feeds/packages/lang/rust/rust-package.mk

RUST_STYLE_FLAGS:=

define Package/phantun-common
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=VPN
  TITLE:=Phantun Common Files
  URL:=https://github.com/dndx/phantun
  DEPENDS:=+kmod-tun
  HIDDEN:=1
endef

define Package/phantun-common/description
  Common files (init script, default config) for Phantun Client and Server.
endef

define Package/phantun-common/conffiles
/etc/config/phantun
endef

define Package/phantun-common/install
	$(INSTALL_DIR) $(1)/etc/init.d $(1)/etc/config
	$(INSTALL_BIN) files/phantun.init $(1)/etc/init.d/phantun
	$(INSTALL_CONF) files/phantun.config $(1)/etc/config/phantun
endef

define Package/phantun-client
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=VPN
  TITLE:=Phantun Client - A lightweight and fast UDP to TCP obfuscator
  URL:=https://github.com/dndx/phantun
  DEPENDS:=+phantun-common
endef

define Package/phantun-client/description
  Phantun Client obfuscates UDP packets into fake TCP connections.
endef

define Package/phantun-client/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/client $(1)/usr/sbin/phantun-client
endef

define Package/phantun-server
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=VPN
  TITLE:=Phantun Server - A lightweight and fast UDP to TCP obfuscator
  URL:=https://github.com/dndx/phantun
  DEPENDS:=+phantun-common
endef

define Package/phantun-server/description
  Phantun Server obfuscates UDP packets into fake TCP connections.
endef

define Package/phantun-server/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/server $(1)/usr/sbin/phantun-server
endef

define Build/Compile
	$(call Build/Compile/Cargo,phantun)
endef

$(eval $(call BuildPackage,phantun-common))
$(eval $(call BuildPackage,phantun-client))
$(eval $(call BuildPackage,phantun-server))
