import React, { useCallback } from "react";
import { open } from "@tauri-apps/api/shell";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";

import RainierSplashBackground from "@app/assets/rainier_splash_background.jpg";
import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";
import { options } from "./SplashScreenParticlesOptions";

const SplashScreen = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(
    // eslint-disable-next-line @typescript-eslint/require-await
    async (container: Container | undefined) => {
      console.log(container);
    },
    []
  );

  const openExternalLink = (url: string) => () => {
    void open(url);
  };

  return (
    <div className="absolute top-0 left-0 w-screen h-screen z-50">
      <img
        className="absolute w-full h-full object-cover"
        src={RainierSplashBackground}
        alt="Photo of Mount Rainier at sunset"
      />

      <div
        className="absolute w-full h-full"
        style={{
          background:
            "radial-gradient(50% 103.8% at 50% 50%, rgba(31, 41, 55, 0.1) 0%, rgba(31, 41, 55, 0.6) 100%)",
        }}
      />

      <div
        className="absolute w-full h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(31, 41, 55, 0.4) 0%, rgba(31, 41, 55, 0.9) 100%)",
        }}
      />

      <Particles
        className="absolute w-full h-full"
        id="tsparticles"
        options={options}
        init={particlesInit}
        loaded={particlesLoaded}
      />

      <div
        className="absolute w-full h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(31, 41, 55, 0.4) 0%, rgba(31, 41, 55, 0.9) 100%)",
        }}
      />

      <img
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4"
        src={LogoWhiteSVG}
      />

      <p className="absolute bottom-3 right-3 text-right text-sm text-gray-600">
        Photo by{" "}
        <button
          className="hover:underline"
          onClick={openExternalLink(
            "https://unsplash.com/@calebriston?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          )}
        >
          Caleb Riston
        </button>{" "}
        on{" "}
        <button
          className="hover:underline"
          onClick={openExternalLink(
            "https://unsplash.com/photos/TXiBwX0kg-Q?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          )}
        >
          Unsplash
        </button>
      </p>
    </div>
  );
};

export default SplashScreen;
