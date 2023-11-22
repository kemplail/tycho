import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { useFormik } from 'formik'
import { useAppDispatch } from 'src/hooks'
import { UserLoginSchema } from 'src/schemas/UserLoginSchema'
import { loginUser } from 'src/store/slices/user'
import { ErrorMessage } from 'src/elements/ErrorMessage'
import { SubTitle } from 'src/elements/SubTitle'

export function LoginForm() {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validateOnMount: true,
    validationSchema: UserLoginSchema,
    onSubmit: handleOnSubmit
  })

  const login = useAppDispatch()

  async function handleOnSubmit() {
    await login(
      loginUser({
        username: formik.values.username,
        password: formik.values.password
      })
    )
  }

  return (
    <div className="mb-6">
      <div className="text-center mb-4">
        <SubTitle text="Se connecter" />
      </div>

      <form onSubmit={formik.handleSubmit}>
        {formik.touched.username && formik.errors.username && (
          <ErrorMessage>
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{formik.errors.username}</span>
          </ErrorMessage>
        )}

        <input
          type="text"
          className="block border border-grey-light w-full p-3 rounded mb-4 mt-2"
          name="username"
          placeholder="Pseudonyme"
          onChange={(e) => {
            formik.setFieldTouched('username')
            formik.handleChange(e)
          }}
        />

        {formik.touched.username && formik.errors.password && (
          <ErrorMessage>
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{formik.errors.password}</span>
          </ErrorMessage>
        )}

        <input
          type="password"
          className="block border border-grey-light w-full p-3 rounded mb-4 mt-2"
          name="password"
          placeholder="Mot de passe"
          onChange={(e) => {
            formik.setFieldTouched('password')
            formik.handleChange(e)
          }}
        />

        <button
          type="submit"
          className="w-full text-center bg-blue-600 rounded-md p-2 text-white"
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}
