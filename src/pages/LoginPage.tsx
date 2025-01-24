import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { auth } from "@/integrations/firebase/firebase-config";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Register
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Login efetuado com sucesso!",
          description: "Redirecionando para a página principal...",
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Conta registada com sucesso!",
          description: "Pode agora iniciar sessão com a sua nova conta.",
        });
        setIsLogin(true); // Switch to login after registration
      }
      // After successful auth, navigate to access control page
      navigate("/access-control"); // Redirect to access control page
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "Erro ao iniciar sessão" : "Erro ao registar conta",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout efetuado com sucesso!",
        description: "Sessão terminada.",
      });
      navigate("/"); // Redirect to home or login page after logout
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 pb-4">
          <CardTitle>{isLogin ? "Iniciar Sessão" : "Registar Conta"}</CardTitle>
          <CardDescription>Entre com as suas credenciais para aceder à plataforma</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="mt-4">{isLogin ? "Iniciar Sessão" : "Registar"}</Button>
            </div>
          </form>
          <div className="flex justify-center text-sm">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Criar uma conta" : "Já tenho conta"}
            </Button>
          </div>
          {/* Logout Button - Conditionally render or place elsewhere as needed */}
          {/* <Button variant="destructive" onClick={handleLogout}>Logout</Button> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
