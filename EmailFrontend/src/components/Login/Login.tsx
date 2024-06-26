// src/Login.tsx
import React,{useState} from "react"
import {Popover,PopoverTrigger,PopoverContent,Button,Input} from "@nextui-org/react"
import {API_URL} from "../../utils/constants";

const statusErrorMessages: Record<number,string> = {
    400: "Error de Login: Solicitud incorrecta",
    401: "Error de Login: No autorizado",
    404: "Error de Login: Recurso no encontrado",
    500: "Error de Login: Error interno del servidor",
}

interface LoginProps {
    onLoginSuccess: () => void
}

//TODO: fix and adapt when register ok.
const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const validateEmail = (email: string): boolean => {
    // Expresión regular para validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!validateEmail(username)) {
        setErrorMessage("Por favor, introduce un correo electrónico válido.")
        return
      }

      //Recuerpa ip de json
      // Realizar la solicitud al servidor para autenticar al usuario
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })


      //localStorage.setItem("data1", JSON.stringify(response.json()))

      // Verificar si la autenticación fue exitosa
      if (response.ok) {
        const data = await response.json()
        // Almacenar el token JWT en el localStorage o en las cookies
        localStorage.setItem("jwtToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)

        const userResponse = await fetch(`${API_URL}/user/token`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${data.access}`
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          localStorage.setItem("id", userData.id)
          localStorage.setItem("username", userData.username)
        }

        // Redireccionar al usuario a la página de inicio, por ejemplo
        onLoginSuccess()
      } else {
        // Mostrar un mensaje de error si la autenticación falla
        console.error("Error de inicio de sesión:", response.statusText)
        
      }
    } catch (error) {
      const status = error instanceof Response ? error.status : null
      if (status && status in statusErrorMessages) {
        console.error(statusErrorMessages[status])
      } else {
        console.error("Error de Login")
      }
    }
  }

  return (
    <div className="login-bg  h-screen bg-gradient-to-r from-[#4b61a6] from-0% via-[#4b61a6] via-50% to-[#afb7cf] to-100% flex flex-row  items-center justify-center">
      <div className="login-con absolute p-6 h-auto w-auto rounded-[18px]  bg-[#8091F2]  ">
        <h1 className="text-center m-12 text-[#274073] text-2xl">
          Sign In to EmailBox
        </h1>
        <div className="line-top mb-6 border border-solid border-white "></div>
        <form className="login-form flex flex-col gap-4" onSubmit={handleLogin}>
          <h2 className="font-bold ">User Email</h2>
          <Input
            label="email"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
            }}
          />
          <Input type="password" label="password"  value={password} onChange={(e) => {setPassword(e.target.value)}}/>
          <Popover placement="right">
            <PopoverTrigger>
              <Button color="default" onClick={handleLogin}>
                Login
              </Button>
            </PopoverTrigger>
            <PopoverContent>  
              <div className="px-1 py-2">
                <div className="text-small font-bold">Alert</div>
                <div className="text-tiny">
                  {errorMessage && <div>{errorMessage}</div>}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </form>
        <br />
        <p>Don't have an account? <a href="/register" className="text-white">Sign Up</a></p>
        <div className="line-bottom mt-6 border border-solid border-white"></div>
      </div>
    </div>
  )
}

export default Login
