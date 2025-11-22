"use client";

import { useUiStore } from "@/store/ui-store";
import { AnimatePresence, motion } from "framer-motion";
import { capetalizeFirstLetter } from "../../helpers";
import { sections } from "../../statics";
import styles from "./mega-menu.module.sass";

const MegaMenu = () => {
  const { isOpen } = useUiStore();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`d-flex align-items-center ${styles.megaMenu}`}
          initial={{ opacity: 0, x: -550 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -550 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {sections.map((section, index) => (
              <motion.div
                className={`w-100 ${styles.item}`}
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1 + 0.3,
                  ease: "easeOut",
                }}
              >
                <div className={`${styles.wrapper}`}>
                  {capetalizeFirstLetter(section.name)}
                  {section.active && <div className={`${styles.line}`} />}
                </div>
              </motion.div>
            ))}
          </motion.div>
          {/* <div className={`w-100 p-3 text-center ${styles.logo}`}>
            <img className={`${styles.logo}`} src="/static/logo.png" width="100%"/>
          </div> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
