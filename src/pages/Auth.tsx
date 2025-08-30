import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const email = loginForm.email.trim().toLowerCase();

    if (!email || !loginForm.password) {
      setError('Bitte füllen Sie alle Felder aus');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signIn(email, loginForm.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Ungültige Zugangsdaten oder E-Mail nicht bestätigt.');
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Erfolgreich angemeldet');
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const email = signupForm.email.trim().toLowerCase();

    if (!email || !signupForm.password || !signupForm.confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus');
      setIsSubmitting(false);
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsSubmitting(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signUp(email, signupForm.password);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Ein Benutzer mit dieser E-Mail-Adresse ist bereits registriert');
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Registrierung erfolgreich! Prüfen Sie Ihre E-Mail zur Bestätigung oder melden Sie sich direkt an, falls Bestätigung deaktiviert ist.');
        // Reset form and switch to login tab
        setSignupForm({ email: '', password: '', confirmPassword: '' });
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendEmail = async () => {
    const email = loginForm.email.trim().toLowerCase();
    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail im Login-Formular ein.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        setError(error.message);
      } else {
        toast.success('Bestätigungs-E-Mail erneut gesendet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-automotive-primary/10 via-background to-automotive-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-12 h-12 animate-pulse mx-auto mb-4 text-automotive-primary" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-automotive-primary/10 via-background to-automotive-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-automotive-primary rounded-full mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Fahrtenbuch</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Ihre Fahrten und Fahrzeuge digital
          </p>
        </div>

        <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Willkommen</CardTitle>
            <CardDescription className="text-center">
              Melden Sie sich an oder erstellen Sie ein neues Konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Anmelden
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registrieren
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ihre.email@beispiel.de"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-automotive-primary hover:bg-automotive-primary/90" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird angemeldet...' : 'Anmelden'}
                  </Button>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    <span>Noch keine Bestätigung erhalten? </span>
                    <Button
                      type="button"
                      variant="link"
                      className="px-1"
                      onClick={resendEmail}
                      disabled={isSubmitting || !loginForm.email}
                    >
                      E-Mail erneut senden
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ihre.email@beispiel.de"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-automotive-accent hover:bg-automotive-accent/90" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird registriert...' : 'Registrieren'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 Fahrtenbuch - Digitale Fahrzeugverwaltung</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;