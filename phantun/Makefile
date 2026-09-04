#
# phantun - A lightweight and fast UDP to TCP obfuscator
# https://github.com/dndx/phantun
#
# Packaging based on https://github.com/hizukiayaka/phantun-openwrt,
# updated to upstream dndx/phantun v0.8.1 with an extended init script.
#
# This Makefile installs the official static musl release binaries
# (phantun_x86_64-unknown-linux-musl.zip) so no Rust cross toolchain is
# needed in the SDK. To build from source instead, switch PKG_SOURCE_*
# to the git protocol and use rust-package.mk like the reference repo.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=phantun
PKG_VERSION:=0.8.1
PKG_RELEASE:=1

PKG_SOURCE:=phantun_x86_64-unknown-linux-musl.zip
PKG_SOURCE_URL:=https://github.com/dndx/phantun/releases/download/v$(PKG_VERSION)/
PKG_HASH:=0cf40f0ac48411f8ced94ce0afd617105c6b9a69ad8db137c3b1e4d184d6fcdb

PKG_BUILD_DIR:=$(BUILD_DIR)/phantun-$(PKG_VERSION)
PKG_BUILD_PARALLEL:=0

include $(INCLUDE_DIR)/package.mk

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
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/phantun_client $(1)/usr/sbin/phantun-client
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
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/phantun_server $(1)/usr/sbin/phantun-server
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(STAGING_DIR_HOST)/bin/unzip -o -j $(DL_DIR)/$(PKG_SOURCE) -d $(PKG_BUILD_DIR)/
endef

define Build/Compile
	# prebuilt binaries, nothing to compile
endef

define Build/Install
	# prebuilt binaries, nothing to install
endef

$(eval $(call BuildPackage,phantun-common))
$(eval $(call BuildPackage,phantun-client))
$(eval $(call BuildPackage,phantun-server))
