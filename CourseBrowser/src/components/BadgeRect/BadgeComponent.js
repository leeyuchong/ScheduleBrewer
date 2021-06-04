import React from 'react';

function BadgeComponent(props) {
    const classes = "badgeRect "+props.badgeStyle;
    return (
        <div className={classes}>
            {props.content}
        </div>
    );
}

export default BadgeComponent;
