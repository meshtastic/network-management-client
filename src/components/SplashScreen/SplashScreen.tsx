import React, { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/api/shell";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

import RainierSplashBackground from "@app/assets/rainier_splash_background.jpg";
import { options } from "@components/SplashScreen/SplashScreenParticlesOptions";
import SplashScreenLogo from "@components/SplashScreen/SplashScreenLogo";

import "./SplashScreen.css";

const SplashScreen = () => {
  const [isParticlesLoaded, setParticlesLoaded] = useState(false);
  const [isScreenLoaded, setScreenLoaded] = useState(false);
  const [isScreenVisible, setScreenVisible] = useState(true);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // eslint-disable-next-line @typescript-eslint/require-await
  const particlesLoaded = useCallback(async () => {
    setParticlesLoaded(true);
  }, []);

  useEffect(() => {
    if (!isParticlesLoaded) return;

    const loadingHandle = setTimeout(() => {
      setScreenLoaded(true);
    }, 1200);

    return () => {
      clearTimeout(loadingHandle);
    };
  }, [isParticlesLoaded]);

  useEffect(() => {
    if (!isScreenLoaded) return;

    const fadeOutHandle = setTimeout(() => {
      setScreenVisible(false);
    }, 5000);

    return () => {
      clearTimeout(fadeOutHandle);
    };
  }, [isScreenLoaded]);

  const openExternalLink = (url: string) => () => {
    void open(url);
  };

  return (
    <div
      className="splash-screen-opacity absolute top-0 left-0 w-screen h-screen z-50"
      style={{ opacity: isScreenVisible ? 1 : 0 }}
    >
      <img
        className="absolute w-full h-full object-cover bg-gray-200 transition-all"
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

      {isScreenLoaded && (
        <SplashScreenLogo className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}

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

      <div
        className="splash-screen-opacity absolute w-full h-full bg-white transition-all"
        style={{ opacity: isScreenLoaded ? 0 : 1 }}
      />
    </div>
  );
};

export default SplashScreen;
