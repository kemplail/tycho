import * as Yup from 'yup';

export const UserLoginSchema = Yup.object().shape({
    username: Yup.string()
      .required('Champs requis'),
    password: Yup.string()
        .required('Champs requis'),
});