import * as React from 'react';
import { sections } from '../../statics';
import { capetalizeFirstLetter } from '../../helpers'
import { useDispatch, useSelector } from "react-redux";
import Fade from 'react-reveal/Fade';
import styles from "./mega-menu.module.sass";
import { ACTIVATE_SECTION, TOGGLE_MENU } from '@/store/types';
import Zoom from 'react-reveal/Zoom';
import { useState } from 'react';
import { useEffect } from 'react';

const MegaMenu = () => {
  const [scrollTopSectionsList, setScrollTopSectionsList] = useState<null|number[]>(null);
  const ui = useSelector((state: any) => state.ui);
  const dispatch: any = useDispatch();

  const activateSection = (index: number) => () => {
    closeMenuAfter500ms();
    goToActiveSection(index);
  }

  const setActiveSection = (index: number) => () => {
    dispatch({
      type: ACTIVATE_SECTION,
      payload: { activeSection: index },
    })
  }

  const closeMenuAfter500ms = () => {
    setTimeout(() => {
      dispatch({ type: TOGGLE_MENU });
    }, 300);
  }

  const goToActiveSection = (index: number) => {
    const { name } = sections[index];
    const sectionEl: HTMLElement = document.getElementById(name);
    const mainContentEl: HTMLElement = document.querySelector('.content-main');
    if (sectionEl && mainContentEl) {
      const offsetTop = sectionEl.offsetTop;
      mainContentEl.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  }

  const sectionsToScrollTop = () => {
    if (scrollTopSectionsList) {
      return scrollTopSectionsList;
    }
    const newScrollTopSectionsList = sections.map(({ name }) => {
      const sectionEl: HTMLElement = document.getElementById(name);
      return sectionEl ? sectionEl.offsetTop : 0;
    });
    setScrollTopSectionsList(newScrollTopSectionsList);
    return newScrollTopSectionsList;
  }

  const getCurrentSectionWithScrollHeight = (height: number, scrollTopSectionsList: number[]) => {
    return scrollTopSectionsList.findIndex(item => item >= height);
  }

  const reactiveActiveSection = () => {
    const mainContentEl: HTMLElement = document.querySelector('.content-main');
    if (mainContentEl) {
      mainContentEl.onscroll = (event: any) => {
        const scrollTopSectionsList = sectionsToScrollTop();
        const scrollHeight = event.target.scrollTop;
        const activeSectionByScroll = getCurrentSectionWithScrollHeight(scrollHeight, scrollTopSectionsList);
        setActiveSection(activeSectionByScroll)();
      }
    }
  }

  useEffect(() => {
    reactiveActiveSection();
  }, [])

  return (
    <Fade left={true} when={ui.isOpen} unmountOnExit={true} collapse={true}>
      <div className={`d-flex align-items-center ${styles.megaMenu}`}>
        <Fade left cascade unmountOnExit={true} mountOnEnter={true} appear={ui.isOpen} when={ui.isOpen} exit={true} distance="550px">
          <div>
            {sections.map(
              (section, index) => (
                <div onClick={activateSection(index)} className={`w-100 ${styles.item}`} key={index}>
                  <div className={`${styles.wrapper} position-relative`}>
                    {capetalizeFirstLetter(section.name)}
                    <Zoom opposite when={ui.activeSection === index}>
                      {ui.activeSection === index && <div className={`${styles.line} position-absolute`} />}
                    </Zoom>
                  </div>
                </div>
              )
            )}
          </div>
        </Fade>
      </div>
    </Fade>
  );
}

export default MegaMenu;
