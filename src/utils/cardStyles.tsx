import { CardProps } from "antd";
import { theme } from "antd";

/**
 * @deprecated Utiliser `useCardStyles()` à la place pour bénéficier des tokens du thème actif.
 */
export const cardStyles: CardProps["styles"] = {
  body: {
    padding: "0px",
    height: "100%",
  },
  header: {
    padding: "5px",
    paddingLeft: "15px",
    fontSize: 14,
    minHeight: 35,
  },
};

/**
 * Hook retournant les styles de Card dérivés des tokens Ant Design actifs.
 * Compatible light/dark.
 */
export const useCardStyles = (): CardProps["styles"] => {
  const { token } = theme.useToken();
  return {
    body: {
      padding: 0,
      height: "100%",
    },
    header: {
      padding: `${token.paddingXXS}px`,
      paddingLeft: `${token.paddingSM}px`,
      fontSize: token.fontSizeSM,
      minHeight: token.controlHeight + 3,
    },
  };
};
