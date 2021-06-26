import React, {useCallback, useRef, useState,useMemo, useEffect, cloneElement} from "react";
import { ResizeObserver } from 'resize-observer';
const DEFAULT_MARGIN = 3;

const defaultStyles = {
        position: 'absolute',
        top: 0,
        willChange: 'transform',
        transition: '.5s ease-in-out',
        // opacity: 0,
        animation: '$enter .5s ease-out forwards',
}


const ListItem = ({
    children,
    height: initialHeight,
    index,
    listRef,
    collection,
    left,
    defaultVisible = false,
    right,
    forceRender,
    firstMount,
    announceChange,
  }) => {
    const visibleRef = useRef(undefined);
    const visibilityRef = useRef(undefined);
    const [height, setHeight] = useState(initialHeight);
    const rootRef = useRef(undefined);
    const elementRef = useRef(undefined);
    const [isVisible, setIsVisible] = useState(defaultVisible);
    const scheduleUnmount = useRef(undefined);
    const isVisibleRef = useRef(isVisible);
  
    const handleScheduleUnmount = useCallback(() => {
      clearTimeout(scheduleUnmount.current);
      scheduleUnmount.current = setTimeout(() => {
        setIsVisible(false);
        isVisibleRef.current = false;
        scheduleUnmount.current = null;
      }, 1000);
    }, []);
  
    const handleTrackVisibilty = useCallback(() => {
      const element = visibilityRef.current;
      const options = {
        root: listRef.current,
        threshold: 0,
      };
  
      const observer = new IntersectionObserver((entry) => {
        if (entry[0].isIntersecting) {
          clearTimeout(scheduleUnmount.current);
          scheduleUnmount.current = null;
        }
        if (!entry[0].isIntersecting && isVisibleRef.current) {
          handleScheduleUnmount();
          return;
        }
  
        // visible
        if (!isVisibleRef.current) {
          isVisibleRef.current = entry[0].isIntersecting;
          setIsVisible(entry[0].isIntersecting);
        }
      }, options);
  
      observer.observe(element);
      return () => {
        observer.unobserve(element);
        observer.disconnect();
      };
    }, [handleScheduleUnmount, listRef]);
  
    const handleTrackHeight = useCallback(() => {
      const element = visibilityRef.current;
      const child = element.childNodes.item(0);
  
      const trigger = () => {
        if ((scheduleUnmount.current)) return; // pending unmount
        let newHeight = 0;
        const child = element.childNodes.item(0);
        if ((child)) newHeight = child.clientHeight;
        else newHeight = element.clientHeight || initialHeight;
        setHeight(newHeight);
        announceChange();
      };
      trigger();
  
      const observer = new ResizeObserver(trigger);
      observer.observe(child || element);
      return () => {
        observer.unobserve(child || element);
        observer.disconnect();
      };
    }, [announceChange, initialHeight]);
  
    //  tracking height
    useEffect(() => {
      if (!isVisible) return;
      let clearUp = null;
  
      const timeout = setTimeout(() => {
        if ((scheduleUnmount.current)) return; // pending unmount
        clearUp = handleTrackHeight();
      }, 250);
  
      return () => {
        clearTimeout(timeout);
        if ((clearUp)) clearUp();
      };
    }, [handleTrackHeight, isVisible]);
  
    // tracking visibility
    useEffect(() => {
       const clearUp = handleTrackVisibilty();

      return () => {
        if ((clearUp)) clearUp();
      };
    }, [handleTrackVisibilty]);
  
    useEffect(() => {
      return () => {
        // clear parent ref
        clearTimeout(scheduleUnmount.current);
        delete collection.current[(children).key];
        announceChange();
      };
    }, []);
  
    const position = useMemo(() => {
      let offset = 0;
      offset = Object.values(collection.current).reduce((state, internalRef) => {
        if (internalRef.index >= index) return state;
        if (!(internalRef.ref)) return state + initialHeight;
        return state + internalRef.ref.clientHeight;
      }, 0);
  
      return offset + DEFAULT_MARGIN * index;
    }, [collection, initialHeight, forceRender, index]);
  
    const controlledChildren = (() => {
      return cloneElement(children, {
        ref: (ref) => {
          elementRef.current = ref;
          collection.current[(children).key] = {
            ...collection.current[(children).key],
            ref,
            index,
          };
          return ref;
        },
      });
    })()
  
    const styles = (() => {
      let animationDelay = 0;
      if (firstMount.current) {
        animationDelay = 0.1 * index;
        if (index >= 20) animationDelay = 0;
      } else {
        animationDelay = 0.1;
      }
      const defaultProps = {
          ...defaultStyles,
        willChange: 'transform',
        transform: `translateY(${position}px) perspective(1px)`,
        animationDelay: `${animationDelay}s`,
        left,
        right,
        transitionDuration: '.25s',
        transitionTimingFunction: 'ease',
      };
  
      return defaultProps;
    })();
  
    return (
      <div
        ref={rootRef}
        style={styles}
      >
        <div
          style={{
            width: '100%',
            height,
          }}
          ref={visibleRef}
        >
          <div ref={visibilityRef} style={{ height: '100%' }}>
            {isVisible && controlledChildren}
          </div>
        </div>
      </div>
    );
  };
  

  export default ListItem