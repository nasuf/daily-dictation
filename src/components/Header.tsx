import React, { useState } from "react";
import { Layout, Menu, Space, Dropdown, message } from "antd";
import { GlobalOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/api/api";
import LoginModal from "@/components/LoginModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser, setUser } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import {
  LogoContainer,
  LogoIcon,
  LogoText,
  StyledAvatar,
} from "@/components/dictation/video/Widget";

const { Header } = Layout;

interface AppHeaderProps {
  showLoginModal: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ showLoginModal }) => {
  const { i18n, t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.verifyGoogleToken(
          tokenResponse.access_token
        );
        localStorage.setItem("jwt_token", response.data.jwt_token);
        dispatch(setUser(response.data));
        message.success(t("loginSuccessfulWithGoogle"));
        setIsLoginModalVisible(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Login failed:", error);
        message.error(t("loginFailedWithGoogle"));
        localStorage.removeItem("jwt_token");
      }
    },
    onError: () => {
      console.log("Login Failed");
      message.error(t("loginFailedWithGoogle"));
      localStorage.removeItem("jwt_token");
    },
  });

  const logout = async () => {
    try {
      const response = await api.logout();
      if (response.status === 200) {
        dispatch(clearUser());
        localStorage.removeItem("jwt_token");
        message.success(t("logoutSuccessful"));
      } else {
        message.error(t("logoutFailed"));
      }
    } catch (error) {
      console.error("Logout failed:", error);
      message.error(t("logoutFailed"));
    } finally {
      navigate("/");
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
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        {t("userProfile")}
      </Menu.Item>
      {userInfo?.role === "admin" && (
        <Menu.Item key="admin" onClick={() => navigate("/admin/channel")}>
          {t("adminPanel")}
        </Menu.Item>
      )}
      <Menu.Item key="logout" onClick={logout}>
        {t("logout")}
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
      <LogoContainer onClick={() => navigate("/")}>
        <LogoIcon />
        <LogoText>Daily Dictation</LogoText>
      </LogoContainer>
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
              {t("login")}
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
