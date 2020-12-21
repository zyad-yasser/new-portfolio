import * as React from 'react';
import { useEffect } from 'react';
import styles from './introduction.module.sass';

const Introduction = (props) => {
  useEffect(() => {
    (function () {
      // Init
      var container: HTMLElement = document.querySelector('.s-container');
      var inner: HTMLElement = document.querySelector('.inner');

      // Mouse
      var mouse = {
        _x: 0,
        _y: 0,
        x: 0,
        y: 0,
        updatePosition: function (event) {
          var e = event || window.event;
          this.x = e.clientX - this._x;
          this.y = (e.clientY - this._y) * -1;
        },
        setOrigin: function (e) {
          this._x = e.offsetLeft + Math.floor(e.offsetWidth / 2);
          this._y = e.offsetTop + Math.floor(e.offsetHeight / 2);
        },
        show: function () {
          return '(' + this.x + ', ' + this.y + ')';
        },
      };

      // Track the mouse position relative to the center of the container.
      mouse.setOrigin(container);

      //-----------------------------------------

      var counter = 0;
      var updateRate = 10;
      var isTimeToUpdate = function () {
        return counter++ % updateRate === 0;
      };

      //-----------------------------------------

      var onMouseEnterHandler = function (event) {
        update(event);
      };

      var onMouseLeaveHandler = function () {
        //@ts-ignore
        inner.style = '';
      };

      var onMouseMoveHandler = function (event) {
        if (isTimeToUpdate()) {
          update(event);
        }
      };

      //-----------------------------------------

      var update = function (event) {
        mouse.updatePosition(event);
        updateTransformStyle(
          (mouse.y / inner.offsetHeight / 2).toFixed(2),
          (mouse.x / inner.offsetWidth / 2).toFixed(2),
        );
      };

      var updateTransformStyle = function (x, y) {
        var style = 'rotateX(' + x * 25 + 'deg) rotateY(' + y * 50 + 'deg)';
        inner.style.transform = style;
      };

      //-----------------------------------------

      container.onmouseenter = onMouseEnterHandler;
      container.onmouseleave = onMouseLeaveHandler;
      container.onmousemove = onMouseMoveHandler;
    })();
  }, []);
  return (
    <div
      id="home"
      className={`d-flex align-items-center justify-content-center s-container w-100 ${styles.container}`}
    >
      <div
        className={`d-flex align-items-center justify-content-center inner w-100 h-100 ${styles.introduction}`}
      >
        <div className={`text-left ${styles.centeredContent}`}>
          <div className={`${styles.jobTitle}`}>
            Full stack software enginner
          </div>
          <div className={`${styles.mainPhrase}`}>THIS IS ZYAD YASSER</div>
          <div className={`text-center ${styles.welcome}`}>
            Welcome to my portfolio
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
