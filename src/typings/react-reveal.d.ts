declare module "react-reveal/Fade" {
  import React from "react";
  interface FadeProps {
    children?: React.ReactNode;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    className?: string;
    duration?: number;
    delay?: number;
    when?: boolean;
  }
  const Fade: React.ComponentType<FadeProps>;
  export default Fade;
}

declare module "react-reveal/Reveal" {
  import React from "react";
  interface RevealProps {
    children?: React.ReactNode;
    effect?: string;
    className?: string;
  }
  const Reveal: React.ComponentType<RevealProps>;
  export default Reveal;
}

declare module "react-reveal/Slide" {
  import React from "react";
  interface SlideProps {
    children?: React.ReactNode;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    className?: string;
    duration?: number;
    delay?: number;
    when?: boolean;
  }
  const Slide: React.ComponentType<SlideProps>;
  export default Slide;
}

declare module "react-reveal/globals" {
  interface Config {
    ssrFadeout?: boolean;
  }
  function config(options: Config): void;
  export default config;
}
