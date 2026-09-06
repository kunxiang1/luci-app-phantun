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

# Official static musl prebuilt. Target triple derived from
# REAL_GNU_TARGET_NAME exactly like feeds/packages/lang/rust/rust-values.mk.
PHANTUN_TARGET:=$(subst openwrt,unknown,$(REAL_GNU_TARGET_NAME))
PHANTUN_TARGET:=$(subst muslgnueabi,musleabi,$(PHANTUN_TARGET))
PHANTUN_TARGET:=$(subst i486,i686,$(subst i586,i686,$(PHANTUN_TARGET)))
ifneq ($(findstring arm,$(PHANTUN_TARGET)),)
  ifeq ($(CONFIG_arm_v7),y)
    PHANTUN_TARGET:=$(subst arm,armv7,$(PHANTUN_TARGET))
  else ifeq ($(CONFIG_arm_v6),)
    PHANTUN_TARGET:=$(subst arm,armv5te,$(PHANTUN_TARGET))
  endif
  ifeq ($(CONFIG_HAS_FPU),y)
    PHANTUN_TARGET:=$(subst musleabi,musleabihf,$(PHANTUN_TARGET))
  endif
endif
# MIPS builds are upstream nightly-only, zip name carries the suffix
ifneq ($(findstring mips,$(PHANTUN_TARGET)),)
  PHANTUN_TARGET:=$(PHANTUN_TARGET)_nightly
endif

# sha256 of every zip published for v0.8.1; unknown arch -> empty hash ->
# make fails loudly at download, add the line then (or build from source)
PKG_HASH_x86_64-unknown-linux-musl:=0cf40f0ac48411f8ced94ce0afd617105c6b9a69ad8db137c3b1e4d184d6fcdb
PKG_HASH_aarch64-unknown-linux-musl:=e3f2336b5173df071c8931b5e0e3d44c57453da0456007ed459ed369610c91fa
PKG_HASH_arm-unknown-linux-musleabihf:=7969f28ae8481a885aae49c70c3e8b6c263fa2bf5c00768789691a4af9947bed
PKG_HASH_armv7-unknown-linux-musleabihf:=71f16f7a18c2ac98f3fec482d99a0e69540966cb867309f615617567d5d2f30f
PKG_HASH_i686-unknown-linux-musl:=46f57319cb8026c4fe8805fb9b8c84918a358b361a0b5f87b9bc1e1a650cc2e5
PKG_HASH_mips-unknown-linux-musl_nightly:=d3e600ff251db12f226ddc4eff43e0c7dbbfcc428e6d87567f2491b28c96dd27
PKG_HASH_mipsel-unknown-linux-musl_nightly:=cf35ff919cc892239af81a825286ff808ec063a741be440b77fab61d16f04919
PKG_HASH_mips64-unknown-linux-muslabi64_nightly:=1bb6b17e7dd2b594a925a5d8c70992db44351773d8044d2a2909f8e5973662dc
PKG_HASH:=$(PKG_HASH_$(PHANTUN_TARGET))

PKG_SOURCE:=phantun_$(PHANTUN_TARGET).zip
PKG_SOURCE_URL:=https://github.com/dndx/phantun/releases/download/v$(PKG_VERSION)/

PKG_BUILD_DIR:=$(BUILD_DIR)/phantun-$(PKG_VERSION)-$(PHANTUN_TARGET)
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
