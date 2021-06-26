import React from 'react'

const style = {
    border: '1px solid #c6c6c6'
}

const Item = ({children}) => {

    return <div style={style}>{children}</div>
}

export default Item