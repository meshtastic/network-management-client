import "./SplashScreenLogo.css";

export interface ISplashScreenLogoProps {
  className?: string;
}

export const SplashScreenLogo = ({ className }: ISplashScreenLogoProps) => {
  return (
    <svg
      width="163"
      height="84"
      viewBox="0 0 163 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Splash Screen Meshtastic Logo</title>
      <g id="Mesh_Logo_Path_Dark" clipPath="url(#clip0_528_1404)">
        <path
          id="logo-mountain"
          d="M158 80.5L108 8L57.5 80.5"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <path
          id="logo-slope"
          d="M61 3.5L8.5 80.5"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <path
          id="logo-plus-horizontal"
          d="M24 14L0 14"
          stroke="#FFFFFF"
          strokeWidth="8"
        />
        <path
          id="logo-plus-vertical"
          d="M12 2L12 26"
          stroke="#FFFFFF"
          strokeWidth="8"
        />
      </g>
      <defs>
        <clipPath id="clip0_528_1404">
          <rect width="163" height="84" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
