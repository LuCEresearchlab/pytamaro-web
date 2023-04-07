import React from 'react';
import CustomSnackbar from './CustomSnackbar';

export default function NetworkErrorSnackbar(props:
{ visible: boolean; setVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { visible, setVisible } = props;

  return <CustomSnackbar visible={visible} setVisible={setVisible} severity="error" message="Network Error" />;
}
