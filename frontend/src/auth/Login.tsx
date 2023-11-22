import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorMessage } from 'src/elements/ErrorMessage'
import { ValidMessage } from 'src/elements/ValidMessage'
import { useAppSelector } from 'src/hooks'
import { LoginForm } from './LoginForm'

export function Login() {
  const acessToken = useAppSelector((state) => state.user.access_token)
  const status = useAppSelector((state) => state.user.status)

  const navigate = useNavigate()

  useEffect(() => {
    if (acessToken && status === 'succeeded') {
      navigate('/')
    }
  }, [status, acessToken, navigate])

  return (
    <div className="container max-w-md mx-auto flex-1 flex flex-col items-center justify-center px-2">
      <div className="bg-white px-6 py-8 rounded shadow text-black w-full border-2">
        {!acessToken && <LoginForm />}
        {status === 'failed' && (
          <ErrorMessage>
            Erreur : Veuillez vérifier vos identifiants
          </ErrorMessage>
        )}
        {status === 'succeeded' ||
          (acessToken && <ValidMessage>Vous êtes connecté !</ValidMessage>)}
      </div>
    </div>
  )
}
