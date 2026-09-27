import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import {login, register, logout, getMe} from "../services/auth.api"


export const useAuth = () =>{
    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context

    const handelLogin = async({email, password}) => {
        setLoading(true)
        try{
            const data = await login({email, password})
            setUser(data.user)
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
        
    }

    const handelRegister = async({username, email, password}) => {
        setLoading(true)
        try{
            setUser(data.user)
            const data = await register({username, email, password})
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
    }

    const handelLogout = async () =>{
        setLoading(true)
        try{
            const data = logout()
            setUser(null)
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        const getAndSetUser = async()=>{
            try{
                const data = await getMe()
                setUser(data.user)
            }catch(err){
                console.log(err)
            }finally{
                setLoading(false)
            }
            
        }

        getAndSetUser()

    },[])

    return {user, loading, handelLogin, handelRegister, handelLogout}
} 