import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Briefcase, Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const success = await login(data.email, data.password);
      if (success) {
        onSuccess();
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-6">
            <Briefcase className="text-white text-2xl h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to JobMindr</h2>
          <p className="text-gray-600">Track your job applications with ease</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {loginError && (
                  <div className="text-sm text-red-600 text-center">
                    {loginError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in to JobMindr
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
          Be the hero we need: drop some feedback magic!{' '}
            <a
             href="https://docs.google.com/forms/d/e/1FAIpQLScdMhOUwFwhfOX6BJDfEsCvGbP4o6vXb7_OBD789soNUl7ffQ/viewform?usp=header"
             target="_blank"
             rel="noopener noreferrer"
             className="text-blue-600 underline hover:text-blue-800"
            >
             Share your thoughts here.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
