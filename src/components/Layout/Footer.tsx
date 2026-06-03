import { Button, Layout, theme, Typography } from "antd";
import { CSSProperties, useContext, useEffect, useState } from "react";
import Slider from "@ant-design/react-slick";

import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { Partner } from "../../types";
import { AppContext } from "./DashboardApp";
import { Z_INDEX } from "../../utils/zIndex";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { Text } = Typography;
const { useToken } = theme;



interface DbFooterProps {
    brands?: Partner[];
    slider?: boolean;
}

/* Logo d'un partenaire.
 * - Lien (nouvel onglet sécurisé) uniquement si l'URL est fournie, sinon image seule.
 * - Hauteur uniforme via le style passé (height fixe + objectFit contain).
 */
const PartnerLogo: React.FC<{ partner: Partner; style: CSSProperties }> = ({ partner, style }) => {
  const img = (
    <img
      style={style}
      src={partner.logo}
      alt={partner.name}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
  return partner.url ? (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name} (ouvre un nouvel onglet)`}
    >
      {img}
    </a>
  ) : (
    img
  );
};

export const DasbhoardFooter: React.FC<DbFooterProps> = ({brands, slider=true}) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768 ? true : false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const { token } = useToken()
/* 🤖 IA Generated effect
* Permet d'afficher ou non le scrollIndicator
*/
  useEffect(() => {
    const checkShadow = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setShowScrollIndicator(scrollTop + windowHeight < docHeight - 1);
    };

    // scroll listener
    window.addEventListener("scroll", checkShadow);
    // observer pour changements dynamiques du contenu
    const observer = new ResizeObserver(checkShadow);
    observer.observe(document.body);

    checkShadow(); // initial

    return () => {
      window.removeEventListener("scroll", checkShadow);
      observer.disconnect();
    };
  }, []);


  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const app_context = useContext(AppContext)

  // Base commune : hauteur fixe uniforme pour tous les logos, sans déformation
  const style_img_base: CSSProperties = {
    height: 48,
    width: "auto",
    maxWidth: "100%",
    objectFit: "contain",
  };
  // Variante slider : centrage dans la slide. Variante flex : pas de marge (gérée par le conteneur).
  const style_img: CSSProperties = slider
    ? { ...style_img_base, margin: "auto" }
    : style_img_base;

  const nbBrands = brands?.length || 0

  // Contenu du footer = logos des partenaires
  // TODO : doit pouvoir être surchargé par l'utilisateur
  const footerContent = brands?.map((p: Partner, i: number) => (
    <PartnerLogo key={`${p.name}-${i}`} partner={p} style={style_img} />
  ))

  return (
    <Layout.Footer
      style={{
        textAlign: "center",
        color: token.colorText,
        backgroundColor: token.colorBgContainer,
        bottom: "0",
        position: "sticky",
        right: "0",
        width: "100%",
        padding: 2,
        height: "auto",
        minHeight: "40px",
        transition: "height 0.5s ease-in-out",
        overflow: "visible",
        borderTop: `1px solid ${token.colorBorder}`,
        zIndex: Z_INDEX.FOOTER,
      }}
    >
      {/* Animations de l'indicateur de scroll (apparition/disparition + survol) */}
      <style>
        {`
          .scroll-indicator {
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .scroll-indicator--visible {
            opacity: 1;
            transform: translateY(0);
          }
          .scroll-indicator__icon {
            pointer-events: none;
            transition: color 0.2s ease;
          }
          .scroll-indicator--visible .scroll-indicator__icon {
            pointer-events: auto;
          }
          .scroll-indicator--visible .scroll-indicator__icon:hover {
            color: ${token.colorPrimary};
            animation: scroll-indicator-bob 0.9s ease-in-out infinite;
          }
          @keyframes scroll-indicator-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(4px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .scroll-indicator,
            .scroll-indicator__icon {
              transition: none;
            }
            .scroll-indicator--visible {
              transform: none;
            }
            .scroll-indicator--visible .scroll-indicator__icon:hover {
              animation: none;
            }
          }
        `}
      </style>
      {/* Dégradé + chevron : indique à l'utilisateur qu'il reste du contenu à scroller */}
      <div
        className={`scroll-indicator${showScrollIndicator ? " scroll-indicator--visible" : ""}`}
        aria-hidden
        style={{
          position: "absolute",
          top: -250,
          left: 0,
          right: 0,
          height: 250,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 8,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "linear-gradient(to bottom, transparent, black)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black)",
          background:
            `linear-gradient(to bottom, transparent, ${token.colorBgContainer})`,
        }}
      >
        <Icon
          icon="material-symbols:keyboard-arrow-down-rounded"
          className="scroll-indicator__icon"
          style={{ color: token.colorText, fontSize: 28 }}
        />
      </div>

      {/* Texte affiché uniquement lorsque le footer est rétracté */}
      {isCollapsed && (
            <Text type="secondary">{app_context?.title} - {app_context?.subtitle}</Text>
      )}

      {/* Logos et contenu du footer affichés lorsque déplié */}
      <div style={{display: isCollapsed ? "none" : "block", padding: "10px 0"}}>
        {
          // Aucun partenaire : on garde le footer (texte + bouton) mais pas de zone logos
          nbBrands === 0
          ? null
          : slider
          // Logos avec défilement (choix par défaut)
          ? <Slider
              // Défilement auto si plus de logos que la largeur de l'écran ne peut en afficher.
              // On défile une "page" entière à la fois (slidesToScroll = slidesToShow).
              autoplay={nbBrands > 4}
              slidesToShow={Math.max(1, Math.min(nbBrands, 4))}
              slidesToScroll={Math.max(1, Math.min(nbBrands, 4))}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    autoplay: nbBrands > 3,
                    slidesToShow: Math.max(1, Math.min(nbBrands, 3)),
                    slidesToScroll: Math.max(1, Math.min(nbBrands, 3))
                  }
                },
                {
                  breakpoint: 600,
                  settings: {
                    autoplay: nbBrands > 2,
                    slidesToShow: Math.max(1, Math.min(nbBrands, 2)),
                    slidesToScroll: Math.max(1, Math.min(nbBrands, 2))
                  }
                },
                {
                  breakpoint: 480,
                  settings: {slidesToShow: 1, slidesToScroll: 1}
                }
              ]}
              infinite={true}
              arrows={false} // affichées en dehors du footer et blanc sur blanc
              autoplaySpeed={6000}
              speed={1000}
            >
              {footerContent}
            </Slider>
          // Défilement désactivé : logos en ligne, centrés et repliables
          : <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
            }}>
              {footerContent}
            </div>
        }
      </div>

      {/* Bouton carré de contrôle pour afficher ou cacher le footer */}
      <Button
        style={{
          position: "absolute",
          bottom: "5px",
          right: "10px",
          zIndex: Z_INDEX.FOOTER_BUTTON,
        }}
        type="primary"
        onClick={toggleCollapse}
        aria-label={ isCollapsed ? "Développer le footer" : "Réduire le footer" }
      >
        { isCollapsed ? <UpOutlined /> : <DownOutlined /> }
      </Button>
    </Layout.Footer>
  );
};
