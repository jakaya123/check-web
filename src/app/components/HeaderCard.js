import React from 'react';
import { StyledProfileCard } from '../styles/js/HeaderCard';

// The "Header Card" is the layout at the top of Source, Profile and Team.
// Currently we have an actual HeaderCard component that the TeamComponent uses,
// but the user profile and source profile are using a selection of these constants
// without the HeaderCard component.
// See: styles/js/HeaderCard
// TODO Standardize to use the HeaderCard in all three components that use this layout.
// @chris 2017-10-17

const HeaderCard = props => (
  <StyledProfileCard>
    <div>{props.children}</div>
  </StyledProfileCard>
);

export default HeaderCard;
