'use client'

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useTheme } from "next-themes"
import { Moon, Sun, AlertTriangle } from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  full_name: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  pokemon_player_id: z.string().optional(),
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const shopVerificationSchema = z.object({
  shop_email: z.string().email("Please enter a valid email address"),
  shop_id: z.string().min(1, "Shop ID is required"),
  shop_image: z.string().min(1, "Shop image is required"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>
type ShopVerificationValues = z.infer<typeof shopVerificationSchema>

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [linkedAccounts, setLinkedAccounts] = useState<{ provider: string, connected: boolean }[]>([])
  const { toast } = useToast()
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      pokemon_player_id: "",
    },
    mode: "onChange",
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const shopVerificationForm = useForm<ShopVerificationValues>({
    resolver: zodResolver(shopVerificationSchema),
    defaultValues: {
      shop_email: "",
      shop_id: "",
      shop_image: "",
    },
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          profileForm.reset({
            username: data.username || '',
            full_name: data.full_name || '',
            pokemon_player_id: data.pokemon_player_id || '',
          })
        }

        // Check linked accounts
        const { data: { user: authUser } } = await supabase.auth.getUser()
        const providers = ['github', 'google']
        const linked = providers.map(provider => ({
          provider,
          connected: authUser?.identities?.some((identity: { provider: string }) => identity.provider === provider) || false
        }))
        setLinkedAccounts(linked)

        // Check verification status
        const { data: verificationData, error: verificationError } = await supabase
          .from('shop_verification_requests')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (verificationError && !verificationError.message.includes('No rows found')) {
          throw verificationError
        }

        if (user.user_metadata?.is_verified_shop) {
          setVerificationStatus('verified')
        } else if (verificationData?.status === 'pending') {
          setVerificationStatus('pending')
        } else {
          setVerificationStatus('none')
        }

      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile"
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: data.username,
          full_name: data.full_name,
          pokemon_player_id: data.pokemon_player_id,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error", 
        description: "Failed to update profile"
      })
    } finally {
      setSaving(false)
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!user) return
    setSaving(true)

    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
      })

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect"
        })
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Password updated successfully"
      })
      passwordForm.reset()
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: "Failed to update password"
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSocialLink(provider: 'github' | 'google') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard/settings`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error(`Error linking ${provider} account:`, error)
      toast({
        title: "Error",
        description: `Failed to link ${provider} account`
      })
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || !event.target.files[0]) return
    setUploadingImage(true)

    try {
      const file = event.target.files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      const fileExt = file.name.split('.').pop()
      // Create a unique filename using timestamp and random string
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('shop-verification')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('shop-verification')
        .getPublicUrl(filePath)

      if (!urlData) {
        throw new Error('Failed to get public URL for uploaded image')
      }
      
      shopVerificationForm.setValue('shop_image', urlData.publicUrl)
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  async function onShopVerificationSubmit(data: ShopVerificationValues) {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('shop_verification_requests')
        .insert({
          user_id: user.id,
          shop_email: data.shop_email,
          shop_id: data.shop_id,
          shop_image: data.shop_image,
          status: 'pending',
          created_at: new Date().toISOString(),
        })

      if (error) throw error

      setVerificationStatus('pending')
      toast({
        title: "Success",
        description: `Verification request submitted successfully. We'll review your application and get back to you.`
      })
      setShowVerificationForm(false)
    } catch (error) {
      console.error('Error submitting verification request:', error)
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (!user) return
    setDeleting(true)

    try {
      // First delete user data from the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) throw profileError

      // For client-side, using auth.updateUser to mark account for deletion
      // by updating user metadata (we can't actually delete from client)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          deleted: true,
          deletion_requested_at: new Date().toISOString()
        }
      })

      if (updateError) throw updateError

      // Sign out the user
      await supabase.auth.signOut()
      
      toast({
        title: "Account Deletion Requested",
        description: "Your profile data has been removed and your account marked for deletion."
      })

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later."
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name. It must be at least 3 characters long.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your real name as it should appear on your profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="pokemon_player_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pokemon Player ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your Pokemon Player ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your official Pokemon TCG Player ID (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Update profile"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage your connected social accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedAccounts.map((account) => (
                <div key={account.provider} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    {account.provider === 'github' ? (
                      <Icons.gitHub className="h-5 w-5" />
                    ) : (
                      <Icons.mail className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{account.provider}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.connected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={account.connected ? "outline" : "default"}
                    onClick={() => handleSocialLink(account.provider as 'github' | 'google')}
                  >
                    {account.connected ? 'Reconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
                <h4 className="font-medium mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. This action is permanent and cannot be undone.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, delete my account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shop Verification</CardTitle>
              <CardDescription>
                Verify your shop to access shop-specific features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Verification Status</p>
                    <p className="text-sm text-muted-foreground">
                      {verificationStatus === 'verified' && 'Verified'}
                      {verificationStatus === 'pending' && 'Pending Verification'}
                      {verificationStatus === 'none' && 'Not Verified'}
                    </p>
                  </div>
                  {verificationStatus === 'none' && !showVerificationForm && (
                    <Button onClick={() => setShowVerificationForm(true)}>
                      Request Verification
                    </Button>
                  )}
                </div>
                {verificationStatus === 'verified' && (
                  <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <div className="flex">
                      <Icons.check className="h-5 w-5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium">Your shop is verified</p>
                        <p className="text-sm">You have access to all shop features</p>
                      </div>
                    </div>
                  </div>
                )}
                {verificationStatus === 'pending' && (
                  <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <div className="flex">
                      <Icons.clock className="h-5 w-5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium">Verification in progress</p>
                        <p className="text-sm">Your request is being reviewed by our team</p>
                      </div>
                    </div>
                  </div>
                )}
                {showVerificationForm && (
                  <Form {...shopVerificationForm}>
                    <form onSubmit={shopVerificationForm.handleSubmit(onShopVerificationSubmit)} className="space-y-8">
                      <FormField
                        control={shopVerificationForm.control}
                        name="shop_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your shop email" {...field} />
                            </FormControl>
                            <FormDescription>
                              The email address associated with your shop.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={shopVerificationForm.control}
                        name="shop_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your shop ID" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your official shop identification number.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={shopVerificationForm.control}
                        name="shop_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Image</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="shop-image"
                                />
                                <label
                                  htmlFor="shop-image"
                                  className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                >
                                  {uploadingImage ? (
                                    <>
                                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : field.value ? (
                                    "Change Image"
                                  ) : (
                                    "Upload Image"
                                  )}
                                </label>
                              </div>
                            </FormControl>
                            {field.value && (
                              <div className="mt-2">
                                <img
                                  src={field.value}
                                  alt="Shop preview"
                                  className="h-32 w-32 rounded-md object-cover"
                                />
                              </div>
                            )}
                            <FormDescription>
                              Upload a clear image of your shop or business license.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-4">
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Verification"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowVerificationForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Select the theme for the dashboard.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTheme("light")}
                      className={theme === "light" ? "bg-accent" : ""}
                    >
                      <Sun className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTheme("dark")}
                      className={theme === "dark" ? "bg-accent" : ""}
                    >
                      <Moon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 