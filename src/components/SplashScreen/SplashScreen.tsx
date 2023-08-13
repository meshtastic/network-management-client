import React, { useCallback, useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { open } from "@tauri-apps/plugin-shell";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

import RainierSplashBackground from "@app/assets/rainier_splash_background.jpg";
import { options } from "@components/SplashScreen/SplashScreenParticlesOptions";
import SplashScreenLogo from "@components/SplashScreen/SplashScreenLogo";

import "@components/SplashScreen/SplashScreen.css";

export interface ISplashScreenProps {
  unmountSelf: () => void;
}

const SplashScreen = ({ unmountSelf }: ISplashScreenProps) => {
  const [isParticlesLoaded, setParticlesLoaded] = useState(false);
  const [isScreenLoaded, setScreenLoaded] = useState(false);
  const [isScreenActive, setScreenActive] = useState(true);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // eslint-disable-next-line @typescript-eslint/require-await
  const particlesLoaded = useCallback(async () => {
    setParticlesLoaded(true);
  }, []);

  // Wait for particles to stabilize
  useEffect(() => {
    if (!isParticlesLoaded) return;

    const loadingHandle = setTimeout(() => {
      setScreenLoaded(true);
    }, 900);

    return () => {
      clearTimeout(loadingHandle);
    };
  }, [isParticlesLoaded]);

  // Wait for animation to complete
  useEffect(() => {
    if (!isScreenLoaded) return;

    const fadeOutHandle = setTimeout(() => {
      setScreenActive(false);
    }, 4500);

    return () => {
      clearTimeout(fadeOutHandle);
    };
  }, [isScreenLoaded]);

  // Wait for hide animation to complete
  useEffect(() => {
    if (isScreenActive) return;

    const unmountHandle = setTimeout(() => {
      unmountSelf();
    }, 900);

    return () => {
      clearTimeout(unmountHandle);
    };
  }, [isScreenActive, unmountSelf]);

  const openExternalLink = (url: string) => () => {
    void open(url);
  };

  return (
    <div
      className="landing-screen-opacity-transition absolute top-0 left-0 w-full h-full z-50"
      style={{ opacity: isScreenActive ? 1 : 0 }}
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

      <div
        className="landing-screen-opacity-transition absolute w-full h-full bg-white transition-all"
        style={{ opacity: isScreenLoaded ? 0 : 1 }}
      />

      <p
        className="landing-screen-opacity-transition absolute bottom-3 right-3 text-right text-sm text-gray-600"
        style={{ opacity: isScreenLoaded ? 1 : 0 }}
      >
        <Trans
          i18nKey={"splashPage.photoAttribution"}
          components={{
            link1: (
              <button
                className="hover:underline"
                onClick={openExternalLink(
                  "https://unsplash.com/@calebriston?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                )}
              />
            ),
            link2: (
              <button
                className="hover:underline"
                onClick={openExternalLink(
                  "https://unsplash.com/photos/TXiBwX0kg-Q?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                )}
              />
            ),
          }}
        />
      </p>
    </div>
  );
};

export default SplashScreen;
