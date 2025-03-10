import React from 'react';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface FormInputProps extends Omit<TextFieldProps, 'error'> {
  name: string;
  errors?: string[];
  touched?: boolean;
  showPasswordToggle?: boolean;
  helperText?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  errors = [],
  touched = false,
  showPasswordToggle = false,
  type = 'text',
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const hasError = touched && errors.length > 0;

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormControl error={hasError} fullWidth variant="outlined">
      <TextField
        {...props}
        name={name}
        type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        error={hasError}
        helperText={hasError ? null : helperText}
        InputProps={{
          ...props.InputProps,
          ...(showPasswordToggle && {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: hasError ? 'error.main' : 'primary.main',
                borderWidth: 2,
              },
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: hasError ? 'error.main' : 'primary.main',
            },
          },
          ...props.sx,
        }}
      />
      {hasError && (
        <FormHelperText sx={{ px: 1 }}>
          {errors.map((error, index) => (
            <span key={index}>
              {error}
              {index < errors.length - 1 && <br />}
            </span>
          ))}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormInput; 