
import React, { CSSProperties, useContext, useEffect, useState } from "react";
import { Layout, Menu, theme, Row, Col, Button, Divider, Typography } from "antd";

import { Link, NavLink, useLocation } from "react-router-dom";

import { generateMenuItems } from "../../utils/route_utils";
import { RouteConfig } from "../../types";
import { AppContext } from "./DashboardApp";
import { Icon } from "@iconify/react";
import { Z_INDEX } from "../../utils/zIndex";
import { ThemeToggle } from "../../theme";
import { useBrandLogo } from "../../theme/hooks/useBrandLogo";
const { Text } = Typography

const style_img: CSSProperties = {
  height:52,
  maxWidth:"100%",
  objectFit:"contain"
};

interface DbSiderProps {
  logo?: string; //Override app logo
  route_config?:RouteConfig[];
  //menu?: React.ReactElement; // Pour passer directement un menu (remplace celui du Sider)
  style?: CSSProperties;
  poweredBy?: boolean
}

const DashboardSider: React.FC<DbSiderProps> = ({style, logo, route_config, poweredBy=true}) => {
  const {logo: appLogo, title} = useContext(AppContext)
  const brandLogo = useBrandLogo();
  const effectiveLogo = logo ?? brandLogo?.src ?? appLogo;
  const effectiveAlt = brandLogo?.alt ?? title;

  const { token } = theme.useToken();
  const { pathname:selectedKey } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(isMobile ? true : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const siderStyle: CSSProperties = {
    overflow: 'auto',
    height: "100vh",
    backgroundColor: token.colorBgContainer,
    zIndex: Z_INDEX.SIDER,
    position: 'sticky',
    top:'0',
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    ...style
  };

  return (
    <Layout.Sider
      theme="light"
      collapsible
      collapsedWidth={isMobile ? 40 : 80} //Utiliser la propriété breakpoint ?
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      style={siderStyle}
      width={isMobile ? '80%' : 220}
      trigger={null}
    >
      <Row justify="center">
        <Col span={24}>
          <div
            style={{
              margin: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: token.colorBgElevated,
            }}
          >


            <NavLink to={""} style={{
                display:collapsed ? 'none' : undefined,
                marginTop:8, marginLeft:8
                }}>
              <img style={style_img} src={effectiveLogo} alt={effectiveAlt} />
            </NavLink>
            <Divider style={{display:collapsed ? 'none' : undefined}} type="vertical" />
            <Button 
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <Icon icon="material-symbols:keyboard-double-arrow-right-rounded" /> : <Icon icon="material-symbols:keyboard-double-arrow-left-rounded" /> }
              style={{
                fontSize: '28px',
                width: 32,
                height: 32,
                //backgroundColor: token.colorFillSecondary,
                marginTop:8
              }}
              />


          </div>
        </Col>
        <Col span={24}>
          <Menu
            items={ route_config && generateMenuItems(route_config)}
            selectedKeys={[selectedKey]}
            mode="inline"
            style={{ marginTop: "20px", width: "100%" }}
          />
        </Col>
      </Row>
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "8px",
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 4,
      }}>
        <ThemeToggle />
        { poweredBy && !collapsed && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            Fait avec ❤️ par{" "}<Link to="https://github.com/geo2france/api-dashboard">Géo2France</Link>
          </Text>
        )}
      </div>
    </Layout.Sider>
  );
};


export default DashboardSider ;