import React, { useState } from "react";
import { Layout, Menu, Space, Dropdown, message, Avatar } from "antd";
import { GlobalOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/api/api";
import LoginModal from "@/components/LoginModal";
import { UserInfo } from "@/utils/type";

const { Header } = Layout;

interface AppHeaderProps {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  showLoginModal: () => void;
}

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
`;

const AppHeader: React.FC<AppHeaderProps> = ({
  userInfo,
  setUserInfo,
  showLoginModal,
}) => {
  const { i18n, t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.verifyGoogleToken(
          tokenResponse.access_token
        );
        localStorage.setItem("jwt_token", response.data.jwt_token);
        setUserInfo(response.data);
        message.success("登录成功");
        setIsLoginModalVisible(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Login failed:", error);
        message.error("登录失败，请重试");
        localStorage.removeItem("jwt_token");
      }
    },
    onError: () => {
      console.log("Login Failed");
      message.error("Google 登录失败，请重试");
      localStorage.removeItem("jwt_token");
    },
  });

  const logout = async () => {
    try {
      const response = await api.logout();
      if (response.status === 200) {
        setUserInfo(null);
        localStorage.removeItem("jwt_token");
        message.success("已退出登录");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        message.error("退出登录失败，请重试");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("退出登录失败，请重试");
    }
  };

  const languageMenu = (
    <Menu
      onClick={({ key }) => toggleLanguage(key as string)}
      selectedKeys={[currentLanguage]}
    >
      <Menu.Item key="en">English</Menu.Item>
      <Menu.Item key="zh">中文</Menu.Item>
      <Menu.Item key="ja">日本語</Menu.Item>
      <Menu.Item key="ko">한국어</Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">{t("个人资料")}</Menu.Item>
      <Menu.Item key="logout" onClick={logout}>
        {t("退出登录")}
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["home"]}
          items={[{ key: "home", label: "Daily Dictation" }]}
          style={{ background: "transparent" }}
        />
      </div>
      <Space>
        <Dropdown overlay={languageMenu} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()} style={{ color: "white" }}>
            <Space>
              <GlobalOutlined />
              {i18n.language === "en"
                ? "English"
                : i18n.language === "zh"
                ? "中文"
                : i18n.language === "ja"
                ? "日本語"
                : i18n.language === "ko"
                ? "한국어"
                : "Language"}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
        {userInfo ? (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <StyledAvatar
              src={userInfo.avatar}
              icon={<UserOutlined />}
              style={{ verticalAlign: "middle" }}
            />
          </Dropdown>
        ) : (
          <a onClick={showLoginModal} style={{ color: "white" }}>
            <Space>
              <UserOutlined />
              {t("登录")}
              <DownOutlined />
            </Space>
          </a>
        )}
      </Space>
      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onGoogleLogin={() => login()}
      />
    </Header>
  );
};

export default AppHeader;
