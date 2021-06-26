import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ListItem from './list-item'
const DEFAULT_MARGIN = 3;





const SmartSort = ({
  children,
  height,
  left = 10,
  right = 10,
  loading = false,
  className = '',
  defaultVisibles = 10,
}) => {
  const firstMount = useRef(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      firstMount.current = false;
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);
  const listRef = useRef(undefined);
  const refs = useRef({});
  const firstPositions = useRef([]);
  const [forceRender, setForceRender] = useState(0);
  const timeoutForceRender = useRef(undefined);

  const handleForceRender = useCallback(() => {
    clearTimeout(timeoutForceRender.current);
    timeoutForceRender.current = setTimeout(() => {
      setForceRender((state) => state + 1);
    }, 10);
  }, []);

  // children refs
  const controlledChildren = (() => {

    // keep mapped all items
    const mappedChildren = (Array.isArray(children) ? children : [children]).reduce(
      (state, child, index) => {
        state[child.key] = {
          child,
          index,
        };
        return state;
      },
      {}
    );

    // remove old refs
    const newKeys = Object.keys(mappedChildren);
    firstPositions.current = firstPositions.current.filter((first) => {
      // remove unmounted children
      const status = newKeys.includes(first);
      if (!status) delete refs.current[first];
      return status;
    });

    // clear trash
    Object.keys(refs.current).forEach((internalRefKey) => {
      if (!newKeys.includes(internalRefKey))
        delete refs.current[internalRefKey];
    });

    // add new items
    newKeys.forEach((newKey) => {
      if (!firstPositions.current.includes(newKey))
        firstPositions.current.push(newKey);
    });

    const staticChildren = firstPositions.current.map((key) => {
      refs.current[key] = {
        ref: refs.current[key]?.ref,
        index: mappedChildren[key].index,
      };
      return (
        <ListItem
          key={key}
          height={height} // default element hight
          listRef={listRef}
          collection={refs}
          index={mappedChildren[key].index}
          left={left}
          right={right}
          forceRender={forceRender}
          announceChange={handleForceRender}
          firstMount={firstMount}
          defaultVisible={mappedChildren[key].index < defaultVisibles}
        >
          {mappedChildren[key].child}
        </ListItem>
      );
    });
    return staticChildren;
  })();

  useEffect(() => {
    // clear refs on unmount
    return () => {
      // refs.current = {};
      clearTimeout(timeoutForceRender.current);
    };
  }, []);

  const [listHeight, setListHeight] = useState(height);

  useEffect(() => {
    let offset = 0;
    offset = Object.values(refs.current).reduce((state, internalRef, index) => {
      if (!(internalRef.ref)) return state + height;
      return state + internalRef.ref.clientHeight + DEFAULT_MARGIN;
    }, 0);

    setListHeight(offset);
  }, [height, forceRender]);


  if (!(controlledChildren) && !loading)
    return (
      <div
        style={{
            marginTop: 20,
            fontSize: '1.2em',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}
      >
        <div>List is empty</div>
      </div>
    );
  return (
    <div className={(className)} ref={listRef} style={ {
        position: 'relative',
        transition: 'height 1s ease',
        width: '100%',
        height: 'inherit',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}>
      <div style={{ height: 'inherit' }}>
        <div style={{ minHeight: listHeight, height: 'inherit' }}>
          {(controlledChildren) && controlledChildren}
        </div>
      </div>
    </div>
  );
};

export default SmartSort;
