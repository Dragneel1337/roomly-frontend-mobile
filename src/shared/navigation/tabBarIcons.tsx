import type { ReactElement } from "react";
import Svg, { Circle, G, Path } from "react-native-svg";
import { colors } from "@/src/shared/theme/colors";

type TabIconProps = {
  size?: number;
  color?: string;
};

const DEFAULT_COLOR = colors.navBarIcon;

/** Settings — gear (SVG 1) */
export function TabSettingsIcon({ size = 24, color = DEFAULT_COLOR }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.5} />
      <Path
        d="M3.66122 10.6392C4.13377 10.9361 4.43782 11.4419 4.43782 11.9999C4.43781 12.558 4.13376 13.0638 3.66122 13.3607C3.33966 13.5627 3.13248 13.7242 2.98508 13.9163C2.66217 14.3372 2.51966 14.869 2.5889 15.3949C2.64082 15.7893 2.87379 16.1928 3.33973 16.9999C3.80568 17.8069 4.03865 18.2104 4.35426 18.4526C4.77508 18.7755 5.30694 18.918 5.83284 18.8488C6.07287 18.8172 6.31628 18.7185 6.65196 18.5411C7.14544 18.2803 7.73558 18.2699 8.21895 18.549C8.70227 18.8281 8.98827 19.3443 9.00912 19.902C9.02332 20.2815 9.05958 20.5417 9.15224 20.7654C9.35523 21.2554 9.74458 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8478 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.9021C15.0117 19.3443 15.2977 18.8281 15.7811 18.549C16.2644 18.27 16.8545 18.2804 17.3479 18.5412C17.6837 18.7186 17.9271 18.8173 18.1671 18.8489C18.693 18.9182 19.2249 18.7756 19.6457 18.4527C19.9613 18.2106 20.1943 17.807 20.6603 17C20.8677 16.6407 21.029 16.3614 21.1486 16.1272M20.3387 13.3608C19.8662 13.0639 19.5622 12.5581 19.5621 12.0001C19.5621 11.442 19.8662 10.9361 20.3387 10.6392C20.6603 10.4372 20.8674 10.2757 21.0148 10.0836C21.3377 9.66278 21.4802 9.13092 21.411 8.60502C21.3591 8.2106 21.1261 7.80708 20.6601 7.00005C20.1942 6.19301 19.9612 5.7895 19.6456 5.54732C19.2248 5.22441 18.6929 5.0819 18.167 5.15113C17.927 5.18274 17.6836 5.2814 17.3479 5.45883C16.8544 5.71964 16.2643 5.73004 15.781 5.45096C15.2977 5.1719 15.0117 4.6557 14.9909 4.09803C14.9767 3.71852 14.9404 3.45835 14.8478 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74458 2.35523 9.35523 2.74458 9.15224 3.23463C9.05958 3.45833 9.02332 3.71848 9.00912 4.09794C8.98826 4.65566 8.70225 5.17191 8.21891 5.45096C7.73557 5.73002 7.14548 5.71959 6.65205 5.4588C6.31633 5.28136 6.0729 5.18269 5.83285 5.15108C5.30695 5.08185 4.77509 5.22436 4.35427 5.54727C4.03866 5.78945 3.80569 6.19297 3.33974 7C3.13231 7.35929 2.97105 7.63859 2.85138 7.87273"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Calendar (SVG 2) */
export function TabCalendarIcon({ size = 24, color = DEFAULT_COLOR }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M7 4V2.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M17 4V2.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M21.5 9H16.625H10.75M2 9H5.875" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={17} cy={17} r={1} fill={color} />
      <Circle cx={17} cy={13} r={1} fill={color} />
      <Circle cx={12} cy={17} r={1} fill={color} />
      <Circle cx={12} cy={13} r={1} fill={color} />
      <Circle cx={7} cy={17} r={1} fill={color} />
      <Circle cx={7} cy={13} r={1} fill={color} />
    </Svg>
  );
}

/** Shopping cart (SVG 3) */
export function TabCartIcon({ size = 24, color = DEFAULT_COLOR }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Fridge (SVG 4) */
export function TabFridgeIcon({ size = 24, color = DEFAULT_COLOR }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10V13C4 16.7712 4 18.6569 5.17157 19.8284C6.34315 21 8.22876 21 12 21C15.7712 21 17.6569 21 18.8284 19.8284C20 18.6569 20 16.7712 20 13V10C20 6.22876 20 4.34315 18.8284 3.17157C17.6569 2 15.7712 2 12 2C8.22876 2 6.34315 2 5.17157 3.17157C4.51839 3.82475 4.22937 4.69989 4.10149 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M17 21V22H16V21M8 21V22H7V21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path d="M20 11.5H15M4 11.5H11" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M17 7L17 9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M17 14L17 16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/** Wallet (SVG 5) */
export function TabWalletIcon({ size = 24, color = DEFAULT_COLOR }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G opacity={1}>
        <Path
          d="M10.7496 16.8599V18.8899C10.7496 20.6099 9.14963 21.9999 7.17963 21.9999C5.20963 21.9999 3.59961 20.6099 3.59961 18.8899V16.8599C3.59961 18.5799 5.19963 19.7999 7.17963 19.7999C9.14963 19.7999 10.7496 18.5699 10.7496 16.8599Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10.7498 14.1097C10.7498 14.6097 10.6098 15.0697 10.3698 15.4697C9.77981 16.4397 8.5698 17.0497 7.1698 17.0497C5.7698 17.0497 4.55979 16.4297 3.96979 15.4697C3.72979 15.0697 3.58984 14.6097 3.58984 14.1097C3.58984 13.2497 3.98982 12.4797 4.62982 11.9197C5.27982 11.3497 6.16979 11.0098 7.15979 11.0098C8.14979 11.0098 9.03982 11.3597 9.68982 11.9197C10.3498 12.4697 10.7498 13.2497 10.7498 14.1097Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10.7496 14.11V16.86C10.7496 18.58 9.14963 19.8 7.17963 19.8C5.20963 19.8 3.59961 18.57 3.59961 16.86V14.11C3.59961 12.39 5.19963 11 7.17963 11C8.16963 11 9.05966 11.35 9.70966 11.91C10.3497 12.47 10.7496 13.25 10.7496 14.11Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Path
        d="M22.0002 10.9702V13.0302C22.0002 13.5802 21.5602 14.0302 21.0002 14.0502H19.0402C17.9602 14.0502 16.9702 13.2602 16.8802 12.1802C16.8202 11.5502 17.0602 10.9602 17.4802 10.5502C17.8502 10.1702 18.3602 9.9502 18.9202 9.9502H21.0002C21.5602 9.9702 22.0002 10.4202 22.0002 10.9702Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 10.5V8.5C2 5.78 3.64 3.88 6.19 3.56C6.45 3.52 6.72 3.5 7 3.5H16C16.26 3.5 16.51 3.50999 16.75 3.54999C19.33 3.84999 21 5.76 21 8.5V9.95001H18.92C18.36 9.95001 17.85 10.17 17.48 10.55C17.06 10.96 16.82 11.55 16.88 12.18C16.97 13.26 17.96 14.05 19.04 14.05H21V15.5C21 18.5 19 20.5 16 20.5H13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TAB_ICON_BY_ROUTE: Record<string, (props: TabIconProps) => ReactElement> = {
  shopping: TabCartIcon,
  fridge: TabFridgeIcon,
  calendar: TabCalendarIcon,
  transactions: TabWalletIcon,
  settings: TabSettingsIcon,
};

export function TabBarIcon({
  routeName,
  ...props
}: TabIconProps & { routeName: string }) {
  const Icon = TAB_ICON_BY_ROUTE[routeName];
  if (!Icon) return null;
  return <Icon {...props} />;
}
