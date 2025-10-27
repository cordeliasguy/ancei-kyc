import {
  LogOut,
  Mail,
  Shield,
  UserIcon,
  UserPlus,
  Lock,
  Save,
  Pencil,
  Trash2,
  X,
  Users
} from 'lucide-react'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deleteUserById,
  getAgencyUsersQueryOptions,
  getUserQueryOptions,
  updateUser
} from '@/lib/api'
import type { User, UserRole } from '@server/sharedTypes'
import { InputContainer } from './input-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner'
import z from 'zod/v4'
import { Skeleton } from './ui/skeleton'
import { getInitials } from '@/lib/utils'

const newUserFormInitialValues = {
  name: '',
  email: '',
  password: '',
  role: 'responsible' as UserRole
}

const editUserFormInitialValues = {
  name: '',
  role: 'responsible' as UserRole
}

export const UserProfileDialog = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)

  const { data: session, isPending } = useQuery(getUserQueryOptions)

  const { data: users, isPending: isPendingUsers } = useQuery(
    getAgencyUsersQueryOptions
  )

  const isAdmin = session?.user.role === 'admin'

  const [newUserData, setNewUserData] = useState(newUserFormInitialValues)
  const [editUserData, setEditUserData] = useState(editUserFormInitialValues)

  const isValidEmail = z.email().safeParse(newUserData.email).success
  const isValidPassword = z
    .string()
    .min(8)
    .safeParse(newUserData.password).success

  const isCreateUserAvailable =
    newUserData.name.trim() !== '' && isValidEmail && isValidPassword

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await authClient
      .signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/' })
            queryClient.invalidateQueries({
              queryKey: getUserQueryOptions.queryKey
            })
          }
        }
      })
      .finally(() => setIsSigningOut(false))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)

    try {
      await createUser({ value: newUserData })

      await queryClient.invalidateQueries({
        queryKey: getAgencyUsersQueryOptions.queryKey
      })

      // Reset form after successful creation
      setNewUserData(newUserFormInitialValues)

      toast.success('Usuari creat amb èxit!')
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error("Error al crear l'usuari")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditUserData({
      name: user.name,
      role: user.role
    })
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditUserData({ name: '', role: 'responsible' })
  }

  const handleSaveEdit = async (userId: string) => {
    if (!session) return

    if (!editUserData.name.trim()) {
      toast.info('El nom no pot estar buit')
      return
    }

    setIsEditingUser(false)

    try {
      const updatedUser = await updateUser({ id: userId, value: editUserData })

      if (userId === session.user.id) {
        queryClient.setQueryData(getUserQueryOptions.queryKey, currentData => {
          if (!currentData) return currentData

          return {
            user: {
              ...currentData.user,
              name: updatedUser.name,
              role: updatedUser.role
            }
          }
        })
      }

      queryClient.invalidateQueries({
        queryKey: getAgencyUsersQueryOptions.queryKey
      })

      toast.success('Usuari actualitzat amb èxit!')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error("Error al actualitzar l'usuari")
    } finally {
      setEditingUserId(null)
      setIsEditingUser(false)
    }
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 border-purple-200'
      case 'compliance':
        return 'bg-blue-100 border-blue-200'
      case 'responsible':
        return 'bg-orange-100 border-orange-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'responsible':
        return 'Responsable'
      case 'compliance':
        return 'Compliance'
      case 'ocic':
        return 'Ocic'
      case 'admin':
        return 'Administrator'
      default:
        return 'Responsable'
    }
  }

  if (isPending || isPendingUsers) {
    return <Skeleton className="size-8 rounded-full" />
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8 cursor-pointer">
              {/* <AvatarImage src={session?.user.image} alt={session?.user.name} /> */}
              <AvatarFallback className="bg-blue-100 text-blue-700 ">
                {getInitials(session?.user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil d'usuari</DialogTitle>
            <DialogDescription>
              Gestiona el teu compte i configuració
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Info Section */}
            <Card className={`${getRoleBadgeColor(session?.user.role)}`}>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="size-14">
                    {/* <AvatarImage src={session?.user.image} alt={session?.user.name} /> */}
                    <AvatarFallback
                      className={
                        'bg-blue-100 text-blue-700 text-xl border border-blue-200'
                      }
                    >
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">
                      {session?.user.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session?.user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            {isAdmin && (
              <>
                <Card className="gap-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Panell d'administrador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      defaultValue="create"
                      className="w-full"
                      onValueChange={() => setEditingUserId(null)}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Crear usuari
                        </TabsTrigger>
                        <TabsTrigger value="manage">
                          <Users className="w-4 h-4 mr-2" />
                          Gestionar usuaris
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="create" className="space-y-4 mt-4">
                        <InputContainer>
                          <Label htmlFor="name">
                            <UserIcon className="w-3 h-3 inline" />
                            Nom complet
                          </Label>
                          <Input
                            id="name"
                            placeholder="Joan Garcia"
                            value={newUserData.name}
                            onChange={e =>
                              setNewUserData({
                                ...newUserData,
                                name: e.target.value
                              })
                            }
                          />
                        </InputContainer>

                        <InputContainer>
                          <Label htmlFor="email">
                            <Mail className="w-3 h-3 inline" />
                            Correu electrònic
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="joan@exemple.ad"
                            value={newUserData.email}
                            onChange={e =>
                              setNewUserData({
                                ...newUserData,
                                email: e.target.value
                              })
                            }
                          />
                        </InputContainer>

                        <div className="flex items-center gap-4">
                          <InputContainer className="w-full">
                            <Label htmlFor="password">
                              <Lock className="w-3 h-3 inline" />
                              Contrasenya
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              value={newUserData.password}
                              onChange={e =>
                                setNewUserData({
                                  ...newUserData,
                                  password: e.target.value
                                })
                              }
                            />
                          </InputContainer>

                          <InputContainer className="w-full">
                            <Label htmlFor="role">
                              <Shield className="w-3 h-3 inline" />
                              Rol
                            </Label>
                            <Select
                              value={newUserData.role}
                              onValueChange={value =>
                                setNewUserData({
                                  ...newUserData,
                                  role: value as UserRole
                                })
                              }
                            >
                              <SelectTrigger id="role" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="responsible">
                                  Responsable
                                </SelectItem>
                                <SelectItem value="compliance">
                                  Compliance
                                </SelectItem>
                                <SelectItem value="ocic">Ocic</SelectItem>
                                <SelectItem value="admin">
                                  Administrator
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </InputContainer>
                        </div>

                        <Separator />

                        <Button
                          className="w-full"
                          disabled={isCreatingUser || !isCreateUserAvailable}
                          onClick={handleCreateUser}
                        >
                          {isCreatingUser ? (
                            <>
                              <Spinner className="size-4" />
                              Creant usuari...
                            </>
                          ) : (
                            <>
                              <UserPlus className="size-4" />
                              Crear usuari
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="manage" className="mt-4">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {users?.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No hi ha usuaris per gestionar
                            </p>
                          ) : (
                            users?.map(existingUser => (
                              <Card
                                key={existingUser.id}
                                className="shadow-none py-3"
                              >
                                <CardContent className="px-4">
                                  {editingUserId === existingUser.id ? (
                                    <div className="space-y-3">
                                      <InputContainer>
                                        <Label
                                          htmlFor={`edit-name-${existingUser.id}`}
                                        >
                                          Nom
                                        </Label>
                                        <Input
                                          id={`edit-name-${existingUser.id}`}
                                          value={editUserData.name}
                                          onChange={e =>
                                            setEditUserData({
                                              ...editUserData,
                                              name: e.target.value
                                            })
                                          }
                                        />
                                      </InputContainer>

                                      <InputContainer>
                                        <Label
                                          htmlFor={`edit-role-${existingUser.id}`}
                                        >
                                          Rol
                                        </Label>
                                        <Select
                                          value={editUserData.role}
                                          onValueChange={value =>
                                            setEditUserData({
                                              ...editUserData,
                                              role: value as UserRole
                                            })
                                          }
                                          disabled={
                                            editingUserId === session?.user.id
                                          }
                                        >
                                          <SelectTrigger
                                            id={`edit-role-${existingUser.id}`}
                                            className="w-full"
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="responsible">
                                              Responsable
                                            </SelectItem>
                                            <SelectItem value="compliance">
                                              Compliance
                                            </SelectItem>
                                            <SelectItem value="ocic">
                                              Ocic
                                            </SelectItem>
                                            <SelectItem value="admin">
                                              Administrator
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </InputContainer>

                                      <Separator />

                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleSaveEdit(existingUser.id)
                                          }
                                          className="flex-1"
                                          disabled={
                                            (existingUser.name ===
                                              editUserData.name.trim() &&
                                              existingUser.role ===
                                                editUserData.role) ||
                                            isEditingUser
                                          }
                                        >
                                          {isEditingUser ? (
                                            <>
                                              <Spinner className="size-3" />
                                              Desant...
                                            </>
                                          ) : (
                                            <>
                                              <Save className="size-3" />
                                              Desar
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={handleCancelEdit}
                                          className="flex-1"
                                        >
                                          <X className="w-3 h-3 mr-1" />
                                          Cancel·lar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <Avatar className="h-10 w-10">
                                          {/* <AvatarImage
                                          src={existingUser.image}
                                          alt={existingUser.name}
                                        /> */}
                                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                                            {getInitials(existingUser.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm truncate">
                                            {existingUser.name}
                                          </p>
                                          <p className="text-xs text-gray-600 truncate">
                                            {existingUser.email}
                                          </p>
                                          <Badge
                                            variant="outline"
                                            className={`${getRoleBadgeColor(
                                              existingUser.role
                                            )} mt-1 text-xs`}
                                          >
                                            {getRoleLabel(existingUser.role)}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() =>
                                            handleStartEdit(existingUser)
                                          }
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </Button>

                                        {session?.user.id !==
                                          existingUser.id && (
                                          <DeleteUserButton
                                            deletingUserId={existingUser.id}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}

            <Separator />

            {/* Sign Out Button */}
            <Button
              variant="outline"
              className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <Spinner className="size-4" />
                  Tancant sessió...
                </>
              ) : (
                <>
                  <LogOut className="size-4" />
                  Tancar sessió
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

const DeleteUserButton = ({ deletingUserId }: { deletingUserId: string }) => {
  const queryClient = useQueryClient()

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserById({ id: userId })

      queryClient.setQueryData(
        getAgencyUsersQueryOptions.queryKey,
        existingUsers => existingUsers!.filter(u => u.id !== userId) ?? []
      )

      toast.success('Usuari eliminat amb èxit!')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error("Error al eliminar l'usuari")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estàs segur?</DialogTitle>
          <DialogDescription>
            Aquesta acció no es pot desfer. L'usuari serà eliminat permanentment
            del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel·lar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}
            >
              Eliminar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
