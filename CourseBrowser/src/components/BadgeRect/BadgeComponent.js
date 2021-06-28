import React from 'react';

function BadgeComponent(props) {
    // PROPS: 
    // badgeStyle: The style of the badge. One of Red, Orange, Yellow, Green, 
    //             LightBlue, Blue, Purple, Pink, Grey, White, Brown, Black

    const classes = "badgeRect " + props.badgeStyle;
    return (
        <div className={classes}>
            {props.content}
        </div>
    );
}

export default BadgeComponent;
