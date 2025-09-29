import React, { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Switch } from "./switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "./badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { Separator } from "./separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { MultiSelect } from "./multi-select";

// Schema di validazione
const companyProfileSchema = z.object({
  name: z.string().min(1, "Nome azienda richiesto"),
  owner: z.string().min(1, "Nome proprietario richiesto"),
  vatNumber: z.string().min(1, "Partita IVA richiesta"),
  address: z.string().min(1, "Indirizzo richiesto"),
  city: z.string().min(1, "Città richiesta"),
  postalCode: z.string().min(1, "CAP richiesto"),
  province: z.string().min(1, "Provincia richiesta"),
  country: z.string().min(1, "Nazione richiesta"),
  phone: z.string().min(1, "Telefono richiesto"),
  email: z.string().email("Email non valida").min(1, "Email richiesta"),
  website: z.string().optional(),
  logo: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIBAN: z.string().optional(),
  invoicePrefix: z.string().optional(),
  invoiceNextNumber: z.number().optional(),
  invoiceNotes: z.string().optional(),
  taxRate: z.number().optional(),
});

const jobTypeSchema = z.object({
  name: z.string().min(1, "Nome tipo lavoro richiesto"),
  description: z.string().optional(),
});

const activitySchema = z.object({
  name: z.string().min(1, "Nome attività richiesto"),
  description: z.string().optional(),
  implementationNotes: z.string().optional(),
  jobTypeId: z.number().optional(),
  jobTypeIds: z.union([z.array(z.number()), z.string()]).optional(),
  defaultDuration: z.number().optional(),
  defaultRate: z.number().optional(),
  defaultCost: z.number().optional(),
});

const roleSchema = z.object({
  name: z.string().min(1, "Nome ruolo richiesto"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

// Schema orari lavoro
// Definiamo il tipo per ogni giorno della settimana
const workTimeSchema = z.object({
  start: z.string(),
  end: z.string()
});

const defaultWorkHours = {
  monday: { start: "", end: "" },
  tuesday: { start: "", end: "" },
  wednesday: { start: "", end: "" },
  thursday: { start: "", end: "" },
  friday: { start: "", end: "" },
  saturday: { start: "", end: "" },
  sunday: { start: "", end: "" }
};

const collaboratorSchema = z.object({
  name: z.string().min(1, "Nome collaboratore richiesto"),
  username: z.string().min(1, "Username richiesto"),
  phone: z.string().optional(),
  email: z.string().email("Email non valida").optional(),
  language: z.string().optional(),
  workHours: z.string().optional(),
  roleIds: z.string().min(1, "Seleziona almeno un ruolo"),
  notifyByEmail: z.boolean().optional(),
  notifyByWhatsApp: z.boolean().optional(),
  notificationTime: z.number().optional(),
  isActive: z.boolean().optional(),
});

const clientSchema = z.object({
  name: z.string().min(1, "Nome cliente richiesto"),
  type: z.enum(["residential", "commercial", "industrial"], {
    required_error: "Tipo cliente richiesto",
  }),
  phone: z.string().optional(),
  email: z.string().email("Email non valida").optional(),
  address: z.string().optional(),
  geoLocation: z.string().optional(),
  notes: z.string().optional(),
});

// Permessi disponibili per i ruoli
const availablePermissions = [
  { id: "view_all", label: "Visualizza tutto" },
  { id: "manage_clients", label: "Gestione clienti" },
  { id: "manage_jobs", label: "Gestione lavori" },
  { id: "manage_activities", label: "Gestione attività" },
  { id: "manage_collaborators", label: "Gestione collaboratori" },
  { id: "manage_roles", label: "Gestione ruoli" },
  { id: "manage_company", label: "Gestione dati azienda" },
  { id: "manage_invoices", label: "Gestione fatture" },
  { id: "view_reports", label: "Visualizza report" },
  { id: "delete_all", label: "Elimina (tutto)" },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Fetch dei dati
  const { data: companyProfile } = useQuery({
    queryKey: ['/api/company'],
    select: (data: any) => data || {}
  });
  
  const { data: jobTypes } = useQuery({
    queryKey: ['/api/jobtypes'],
    select: (data: any) => data || []
  });
  
  const { data: activities } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Errore nel recupero delle attività: ${response.statusText}`);
      }
      return await response.json();
    },
    select: (data: any) => data || []
  });
  
  const { data: roles } = useQuery({
    queryKey: ['/api/roles'],
    select: (data: any) => data || []
  });
  
  const { data: collaborators } = useQuery({
    queryKey: ['/api/collaborators'],
    select: (data: any) => data || []
  });
  
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
    select: (data: any) => data || []
  });
  
  // Form setup
  const companyProfileForm = useForm({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: "",
      owner: "",
      vatNumber: "",
      address: "",
      city: "",
      postalCode: "",
      province: "",
      country: "",
      phone: "",
      email: "",
      website: "",
      logo: "",
      bankName: "",
      bankAccount: "",
      bankIBAN: "",
      invoicePrefix: "",
      invoiceNextNumber: 1,
      invoiceNotes: "",
      taxRate: 22,
    }
  });
  
  const jobTypeForm = useForm({
    resolver: zodResolver(jobTypeSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });
  
  const activityForm = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: "",
      description: "",
      implementationNotes: "",
      jobTypeId: undefined,
      jobTypeIds: [],
      defaultDuration: 1,
      defaultRate: 0,
      defaultCost: 0,
    }
  });
  
  const roleForm = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    }
  });
  
  const collaboratorForm = useForm({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: "",
      username: "",
      phone: "",
      email: "",
      language: "it",
      workHours: JSON.stringify(defaultWorkHours),
      roleIds: "",
      notifyByEmail: true,
      notifyByWhatsApp: false,
      notificationTime: 24,
      isActive: true,
    }
  });
  
  const clientForm = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      type: "residential" as const,
      phone: "",
      email: "",
      address: "",
      geoLocation: "",
      notes: "",
    }
  });
  
  // React Query Mutations
  const updateCompanyProfile = useMutation({
    mutationFn: (values: z.infer<typeof companyProfileSchema>) => 
      apiRequest('/api/company', { method: 'PUT', data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company'] });
      toast({
        title: "Profilo aziendale aggiornato",
        description: "Le informazioni aziendali sono state aggiornate con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del profilo aziendale",
        variant: "destructive",
      });
    }
  });
  
  const createJobType = useMutation({
    mutationFn: (values: z.infer<typeof jobTypeSchema>) => 
      apiRequest('/api/jobtypes', { method: 'POST', data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobtypes'] });
      toast({
        title: "Tipo di lavoro creato",
        description: "Il nuovo tipo di lavoro è stato creato con successo",
      });
      jobTypeForm.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del tipo di lavoro",
        variant: "destructive",
      });
    }
  });
  
  const updateJobType = useMutation({
    mutationFn: ({ id, data }: { id: number, data: z.infer<typeof jobTypeSchema> }) => 
      apiRequest(`/api/jobtypes/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobtypes'] });
      toast({
        title: "Tipo di lavoro aggiornato",
        description: "Il tipo di lavoro è stato aggiornato con successo",
      });
      jobTypeForm.reset();
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del tipo di lavoro",
        variant: "destructive",
      });
    }
  });
  
  const createActivity = useMutation({
    mutationFn: (values: any) => 
      apiRequest('/api/activities', { method: 'POST', data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Attività creata",
        description: "La nuova attività è stata creata con successo",
      });
      activityForm.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione dell'attività",
        variant: "destructive",
      });
    }
  });
  
  const updateActivity = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest(`/api/activities/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Attività aggiornata",
        description: "L'attività è stata aggiornata con successo",
      });
      activityForm.reset();
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento dell'attività",
        variant: "destructive",
      });
    }
  });
  
  const createRole = useMutation({
    mutationFn: (values: z.infer<typeof roleSchema>) => 
      apiRequest('/api/roles', { method: 'POST', data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Ruolo creato",
        description: "Il nuovo ruolo è stato creato con successo",
      });
      roleForm.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del ruolo",
        variant: "destructive",
      });
    }
  });
  
  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: number, data: z.infer<typeof roleSchema> }) => 
      apiRequest(`/api/roles/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Ruolo aggiornato",
        description: "Il ruolo è stato aggiornato con successo",
      });
      roleForm.reset();
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del ruolo",
        variant: "destructive",
      });
    }
  });
  
  const createCollaborator = useMutation({
    mutationFn: (values: z.infer<typeof collaboratorSchema>) => 
      apiRequest('/api/collaborators', { method: 'POST', data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborators'] });
      toast({
        title: "Collaboratore creato",
        description: "Il nuovo collaboratore è stato creato con successo",
      });
      collaboratorForm.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del collaboratore",
        variant: "destructive",
      });
    }
  });
  
  const updateCollaborator = useMutation({
    mutationFn: ({ id, data }: { id: number, data: z.infer<typeof collaboratorSchema> }) => 
      apiRequest(`/api/collaborators/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborators'] });
      toast({
        title: "Collaboratore aggiornato",
        description: "Il collaboratore è stato aggiornato con successo",
      });
      collaboratorForm.reset();
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del collaboratore",
        variant: "destructive",
      });
    }
  });
  
  const createClient = useMutation({
    mutationFn: (values: z.infer<typeof clientSchema>) => 
      apiRequest('/api/clients', { method: 'POST', data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Cliente creato",
        description: "Il nuovo cliente è stato creato con successo",
      });
      clientForm.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del cliente",
        variant: "destructive",
      });
    }
  });
  
  const updateClient = useMutation({
    mutationFn: ({ id, data }: { id: number, data: z.infer<typeof clientSchema> }) => 
      apiRequest(`/api/clients/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Cliente aggiornato",
        description: "Il cliente è stato aggiornato con successo",
      });
      clientForm.reset();
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del cliente",
        variant: "destructive",
      });
    }
  });
  
  // Imposta i dati iniziali nei form
  React.useEffect(() => {
    if (companyProfile) {
      companyProfileForm.reset(companyProfile);
    }
  }, [companyProfile]);
  
  // Gestione modifica
  const handleEditJobType = (jobType: any) => {
    jobTypeForm.reset(jobType);
    setEditingId(jobType.id);
    setShowForm(true);
  };
  
  const handleEditActivity = (activity: any) => {
    console.log("Modifica attività:", activity);
    
    // Gestione per jobTypeIds
    let jobTypeIds = [];
    
    try {
      // Se jobTypeIds è una stringa, proviamo a fare il parse
      if (activity.jobTypeIds && typeof activity.jobTypeIds === 'string') {
        try {
          jobTypeIds = JSON.parse(activity.jobTypeIds);
        } catch (e) {
          console.error("Errore nel parsing di jobTypeIds:", e);
          // Se la stringa contiene virgole, proviamo a separarla
          if (activity.jobTypeIds.includes(',')) {
            jobTypeIds = activity.jobTypeIds.split(',').map((s: string) => parseInt(s.trim()));
          } else if (activity.jobTypeIds.trim()) {
            // Altrimenti è solo un valore singolo
            jobTypeIds = [parseInt(activity.jobTypeIds)];
          }
        }
      } else if (activity.jobTypeIds && Array.isArray(activity.jobTypeIds)) {
        // Se è già un array, lo usiamo direttamente
        jobTypeIds = activity.jobTypeIds.map((id: any) => typeof id === 'string' ? parseInt(id) : id);
      }
    } catch (e) {
      console.error("Errore nella gestione dei jobTypeIds:", e);
      jobTypeIds = [];
    }
    
    // Assicuriamoci che jobTypeId principale sia incluso in jobTypeIds
    if (activity.jobTypeId) {
      const jobTypeIdNum = typeof activity.jobTypeId === 'string' ? parseInt(activity.jobTypeId) : activity.jobTypeId;
      
      // Rimuovi l'ID principale se esiste per evitare duplicati
      jobTypeIds = jobTypeIds.filter((id: number) => id !== jobTypeIdNum);
      
      // Metti il jobTypeId principale all'inizio dell'array
      jobTypeIds.unshift(jobTypeIdNum);
    } else if (jobTypeIds.length > 0) {
      // Se non c'è un jobTypeId principale ma ci sono dei jobTypeIds, impostiamo il primo come principale
      activity.jobTypeId = jobTypeIds[0];
    }
    
    console.log("jobTypeIds convertiti:", jobTypeIds);
    
    // Assicuriamoci che implementationNotes sia definito
    const implementationNotes = activity.implementationNotes || "";
    
    // Prepariamo i dati per il form
    activityForm.reset({
      ...activity,
      implementationNotes,
      jobTypeIds: JSON.stringify(jobTypeIds)
    });
    
    console.log("Form reset con dati:", {
      ...activity,
      implementationNotes,
      jobTypeIds: JSON.stringify(jobTypeIds)
    });
    
    setEditingId(activity.id);
    setShowForm(true);
  };
  
  const handleEditRole = (role: any) => {
    roleForm.reset(role);
    setEditingId(role.id);
    setShowForm(true);
  };

  const handleEditCollaborator = (collaborator: any) => {
    // Assicuriamoci che workHours sia una stringa di formato JSON valido
    let workHours = JSON.stringify(defaultWorkHours);
    if (typeof collaborator.workHours === 'string' && collaborator.workHours) {
      try {
        // Verifica che sia un JSON valido tentando di analizzarlo
        JSON.parse(collaborator.workHours);
        workHours = collaborator.workHours;
      } catch (e) {
        console.error("Formato workHours non valido:", e);
      }
    } else if (collaborator.workHours && typeof collaborator.workHours === 'object') {
      try {
        workHours = JSON.stringify(collaborator.workHours);
      } catch (e) {
        console.error("Errore nella conversione di workHours in stringa:", e);
      }
    }
    
    // Converti roleIds in un formato utilizzabile per il form
    let roleIds = [];
    
    // Se esiste collaborator.roles (array di oggetti ruolo)
    if (collaborator.roles && Array.isArray(collaborator.roles)) {
      // Includi tutti i ruoli dall'array di oggetti ruolo
      roleIds = collaborator.roles.map((r: any) => r.id.toString());
    } 
    // Se esiste roleIds, usalo direttamente
    else if (collaborator.roleIds) {
      try {
        roleIds = typeof collaborator.roleIds === 'string' 
          ? JSON.parse(collaborator.roleIds) 
          : collaborator.roleIds;
      } catch (e) {
        console.error("Errore nel parsing dei roleIds:", e);
      }
    }
    // Legacy: fallback su roleId se né roles né roleIds sono disponibili
    else if (collaborator.roleId) {
      roleIds = [collaborator.roleId.toString()];
    }
    
    // Converti tutti gli ID in stringhe
    roleIds = roleIds.map((id: any) => id.toString());
    
    collaboratorForm.reset({
      ...collaborator,
      workHours,
      roleIds: JSON.stringify(roleIds)
    });
    setEditingId(collaborator.id);
    setShowForm(true);
  };

  const handleEditClient = (client: any) => {
    clientForm.reset(client);
    setEditingId(client.id);
    setShowForm(true);
  };

  const onSubmitJobType = (values: z.infer<typeof jobTypeSchema>) => {
    if (editingId) {
      updateJobType.mutate({ id: editingId, data: values });
    } else {
      createJobType.mutate(values);
    }
  };

  const onSubmitActivity = (values: z.infer<typeof activitySchema>) => {
    // Assicuriamoci che jobTypeIds sia nella forma corretta
    let jobTypeIds = [];
    
    try {
      // Se jobTypeIds è una stringa, proviamo a fare il parse
      if (typeof values.jobTypeIds === 'string') {
        try {
          jobTypeIds = JSON.parse(values.jobTypeIds);
        } catch (e) {
          console.error("Errore nel parsing di jobTypeIds:", e);
          // Se fallisce il parse e la stringa contiene virgole, proviamo a separarla
          if (values.jobTypeIds.includes(',')) {
            jobTypeIds = values.jobTypeIds.split(',').map(s => parseInt(s.trim()));
          } else {
            // Altrimenti la trattiamo come un singolo valore
            jobTypeIds = [parseInt(values.jobTypeIds)];
          }
        }
      } else if (Array.isArray(values.jobTypeIds)) {
        // Se è già un array, lo usiamo direttamente
        jobTypeIds = values.jobTypeIds.map(id => typeof id === 'string' ? parseInt(id) : id);
      }
    } catch (e) {
      console.error("Errore nella gestione di jobTypeIds:", e);
      jobTypeIds = [];
    }
    
    // Assicuriamoci che il jobTypeId principale sia impostato e incluso in jobTypeIds
    if (values.jobTypeId) {
      const jobTypeIdNum = typeof values.jobTypeId === 'string' ? parseInt(values.jobTypeId) : values.jobTypeId;
      
      // Rimuovi l'ID principale se esiste per evitare duplicati
      jobTypeIds = jobTypeIds.filter(id => id !== jobTypeIdNum);
      
      // Metti il jobTypeId principale all'inizio dell'array
      jobTypeIds.unshift(jobTypeIdNum);
    } else if (jobTypeIds.length > 0) {
      // Se non c'è un jobTypeId principale ma ci sono dei jobTypeIds, impostiamo il primo come principale
      values.jobTypeId = jobTypeIds[0];
    }
    
    // Prepariamo i dati per l'API
    const dataToSend = {
      ...values,
      jobTypeId: typeof values.jobTypeId === 'string' ? parseInt(values.jobTypeId) : values.jobTypeId,
      jobTypeIds: JSON.stringify(jobTypeIds)
    };
    
    console.log("Dati inviati al server:", dataToSend);
    
    if (editingId) {
      updateActivity.mutate({ id: editingId, data: dataToSend });
    } else {
      createActivity.mutate(dataToSend);
    }
  };

  const onSubmitRole = (values: z.infer<typeof roleSchema>) => {
    if (editingId) {
      updateRole.mutate({ id: editingId, data: values });
    } else {
      createRole.mutate(values);
    }
  };

  const onSubmitCollaborator = (values: z.infer<typeof collaboratorSchema>) => {
    if (editingId) {
      updateCollaborator.mutate({ id: editingId, data: values });
    } else {
      createCollaborator.mutate(values);
    }
  };

  const onSubmitClient = (values: z.infer<typeof clientSchema>) => {
    if (editingId) {
      updateClient.mutate({ id: editingId, data: values });
    } else {
      createClient.mutate(values);
    }
  };
  
  const onSubmitCompanyProfile = (values: z.infer<typeof companyProfileSchema>) => {
    updateCompanyProfile.mutate(values);
  };

  const getJobTypeName = (id: number) => {
    if (!jobTypes) return "Sconosciuto";
    const jobType = jobTypes.find((jt: any) => jt.id === id);
    return jobType ? jobType.name : "Sconosciuto";
  };

  const getRoleName = (id: number) => {
    if (!roles) return "Sconosciuto";
    const role = roles.find((r: any) => r.id === id);
    return role ? role.name : "Sconosciuto";
  };

  return (
    <div className="container mx-auto p-4">
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="company" className="flex items-center gap-1">
            <span className="material-icons text-sm">business</span>
            <span>Azienda</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-1">
            <span className="material-icons text-sm">group</span>
            <span>Clienti</span>
          </TabsTrigger>
          <TabsTrigger value="jobTypes" className="flex items-center gap-1">
            <span className="material-icons text-sm">work</span>
            <span>Tipi di Lavoro</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-1">
            <span className="material-icons text-sm">engineering</span>
            <span>Attività</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1">
            <span className="material-icons text-sm">shield</span>
            <span>Ruoli</span>
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-1">
            <span className="material-icons text-sm">people</span>
            <span>Collaboratori</span>
          </TabsTrigger>
        </TabsList>
        
        {/* PROFILO AZIENDALE */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Profilo Aziendale</CardTitle>
              <CardDescription>
                Gestisci le informazioni della tua azienda che appariranno nelle fatture e nei documenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyProfileForm}>
                <form onSubmit={companyProfileForm.handleSubmit(onSubmitCompanyProfile)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informazioni Generali</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={companyProfileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Azienda *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome della tua azienda" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={companyProfileForm.control}
                        name="owner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proprietario *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome e cognome del proprietario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partita IVA *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci la Partita IVA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Indirizzo</h3>
                    <FormField
                      control={companyProfileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Via e numero civico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={companyProfileForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Città *</FormLabel>
                            <FormControl>
                              <Input placeholder="Città" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={companyProfileForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CAP *</FormLabel>
                            <FormControl>
                              <Input placeholder="CAP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={companyProfileForm.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provincia *</FormLabel>
                            <FormControl>
                              <Input placeholder="Provincia (es. MI)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazione *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nazione" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contatti</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={companyProfileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefono *</FormLabel>
                            <FormControl>
                              <Input placeholder="Telefono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={companyProfileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input placeholder="Email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sito Web</FormLabel>
                          <FormControl>
                            <Input placeholder="Sito web" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informazioni Bancarie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={companyProfileForm.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Banca</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome della banca" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={companyProfileForm.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numero Conto</FormLabel>
                            <FormControl>
                              <Input placeholder="Numero di conto" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="bankIBAN"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IBAN</FormLabel>
                          <FormControl>
                            <Input placeholder="IBAN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Impostazioni Fatturazione</h3>
                    <FormField
                      control={companyProfileForm.control}
                      name="invoicePrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefisso Fattura</FormLabel>
                          <FormControl>
                            <Input placeholder="es. FATTURA-" {...field} />
                          </FormControl>
                          <FormDescription>
                            Il prefisso che verrà aggiunto prima del numero di fattura
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="invoiceNextNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prossimo Numero Fattura</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="1" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Il prossimo numero che verrà utilizzato per le fatture
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aliquota IVA (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="22" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            L'aliquota IVA predefinita per le fatture (percentuale)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyProfileForm.control}
                      name="invoiceNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note Fattura Predefinite</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Note che verranno aggiunte a tutte le fatture" 
                              {...field} 
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Queste note verranno aggiunte automaticamente a tutte le fatture
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="w-full md:w-auto">
                      Salva Profilo Aziendale
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* CLIENTI */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Gestione Clienti</span>
                <Button 
                  onClick={() => {
                    clientForm.reset();
                    setEditingId(null);
                    setShowForm(!showForm);
                  }}
                >
                  {showForm ? "Annulla" : "Nuovo Cliente"}
                </Button>
              </CardTitle>
              <CardDescription>
                Aggiungi, modifica o elimina clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Form {...clientForm}>
                  <form onSubmit={clientForm.handleSubmit(onSubmitClient)} className="space-y-4 mb-6">
                    <FormField
                      control={clientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Cliente *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci nome cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clientForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Cliente *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona tipo cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residenziale</SelectItem>
                              <SelectItem value="commercial">Commerciale</SelectItem>
                              <SelectItem value="industrial">Industriale</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefono</FormLabel>
                            <FormControl>
                              <Input placeholder="Inserisci telefono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clientForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Inserisci email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={clientForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci indirizzo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clientForm.control}
                      name="geoLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordinate Geografiche</FormLabel>
                          <FormControl>
                            <Input placeholder="Lat, Long (es. 45.4642, 9.1900)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Inserisci le coordinate geografiche nel formato Latitudine, Longitudine
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clientForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Inserisci eventuali note" {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          clientForm.reset();
                        }}
                      >
                        Annulla
                      </Button>
                      <Button type="submit">
                        {editingId ? "Aggiorna" : "Salva"} Cliente
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contatti</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients?.map((client: any) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={
                            client.type === 'residential' ? 'secondary' : 
                            client.type === 'commercial' ? 'default' : 
                            'outline'
                          }>
                            {client.type === 'residential' ? 'Residenziale' : 
                             client.type === 'commercial' ? 'Commerciale' : 
                             'Industriale'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div>{client.phone}</div>
                          <div>{client.email}</div>
                        </td>
                        <td className="px-6 py-4">{client.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            Modifica
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TIPI DI LAVORO */}
        <TabsContent value="jobTypes">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Tipi di Lavoro</span>
                <Button 
                  onClick={() => {
                    jobTypeForm.reset();
                    setEditingId(null);
                    setShowForm(!showForm);
                  }}
                >
                  {showForm ? "Annulla" : "Nuovo Tipo di Lavoro"}
                </Button>
              </CardTitle>
              <CardDescription>
                Configura i diversi tipi di lavoro che la tua azienda offre
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Form {...jobTypeForm}>
                  <form onSubmit={jobTypeForm.handleSubmit(onSubmitJobType)} className="space-y-4 mb-6">
                    <FormField
                      control={jobTypeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci nome del tipo di lavoro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={jobTypeForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Inserisci una descrizione" {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          jobTypeForm.reset();
                        }}
                      >
                        Annulla
                      </Button>
                      <Button type="submit">
                        {editingId ? "Aggiorna" : "Salva"} Tipo di Lavoro
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobTypes?.map((jobType: any) => (
                      <tr key={jobType.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{jobType.name}</td>
                        <td className="px-6 py-4">{jobType.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJobType(jobType)}
                          >
                            Modifica
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ATTIVITÀ */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Gestione Attività</span>
                <Button 
                  onClick={() => {
                    activityForm.reset({
                      name: "",
                      description: "",
                      implementationNotes: "",
                      jobTypeId: undefined,
                      jobTypeIds: [],
                      defaultDuration: 1,
                      defaultRate: 0,
                      defaultCost: 0,
                    });
                    setEditingId(null);
                    setShowForm(!showForm);
                  }}
                >
                  {showForm ? "Annulla" : "Nuova Attività"}
                </Button>
              </CardTitle>
              <CardDescription>
                Configura le diverse attività associate ai tipi di lavoro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Form {...activityForm}>
                  <form onSubmit={activityForm.handleSubmit(onSubmitActivity)} className="space-y-4 mb-6">
                    <FormField
                      control={activityForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Attività *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci nome dell'attività" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={activityForm.control}
                      name="jobTypeIds"
                      render={({ field }) => {
                        // Converti field.value in array di stringhe
                        let selectedIds: string[] = [];
                        try {
                          if (typeof field.value === 'string' && field.value) {
                            // Se è una stringa JSON, parse
                            selectedIds = JSON.parse(field.value).map((id: any) => id.toString());
                          } else if (Array.isArray(field.value)) {
                            // Se è già un array, converti in stringhe
                            selectedIds = field.value.map(id => id.toString());
                          }
                        } catch (e) {
                          console.error("Errore nella conversione di jobTypeIds:", e);
                          if (typeof field.value === 'string') {
                            // Se non si riesce a convertire, prova ad usare la stringa direttamente
                            if (field.value.includes(",")) {
                              selectedIds = field.value.split(",").map(s => s.trim());
                            } else {
                              selectedIds = [field.value];
                            }
                          }
                        }
                        
                        return (
                          <FormItem>
                            <FormLabel>Tipi di Lavoro *</FormLabel>
                            <FormControl>
                              <MultiSelect
                                selected={selectedIds}
                                options={jobTypes?.map((jobType: any) => ({
                                  label: jobType.name,
                                  value: jobType.id.toString()
                                })) || []}
                                onChange={(selected) => {
                                  // Aggiorna campo jobTypeIds con una stringa JSON dei valori selezionati
                                  console.log("Nuovi tipi di lavoro selezionati:", selected);
                                  const numericValues = selected.map(s => parseInt(s));
                                  field.onChange(JSON.stringify(numericValues));
                                }}
                                onPrimaryChange={(primary) => {
                                  // Imposta il tipo di lavoro principale
                                  console.log("Tipo di lavoro principale selezionato:", primary);
                                  activityForm.setValue('jobTypeId', parseInt(primary));
                                }}
                                primaryValue={activityForm.watch('jobTypeId')?.toString()}
                                placeholder="Seleziona uno o più tipi di lavoro"
                                required={true}
                              />
                            </FormControl>
                            <FormDescription>
                              Seleziona tutti i tipi di lavoro per cui è utilizzabile questa attività. 
                              Il tipo di lavoro evidenziato con la stella è il principale.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <FormField
                      control={activityForm.control}
                      name="jobTypeId"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input type="hidden" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={activityForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Inserisci una descrizione" {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={activityForm.control}
                      name="implementationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note Realizzazione Attività</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Inserisci note sulla realizzazione di questa attività" {...field} rows={4} />
                          </FormControl>
                          <FormDescription>
                            Istruzioni dettagliate su come eseguire questa attività
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={activityForm.control}
                        name="defaultDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durata Default (ore)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.5" 
                                min="0"
                                placeholder="Durata in ore" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={activityForm.control}
                        name="defaultRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tariffa Oraria Cliente (€)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                placeholder="Tariffa oraria cliente" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Quanto sarà fatturato al cliente per quest'attività
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={activityForm.control}
                        name="defaultCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo Orario Interno (€)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                placeholder="Costo orario per l'azienda" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Costo interno per l'azienda
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      

                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          activityForm.reset();
                        }}
                      >
                        Annulla
                      </Button>
                      <Button type="submit">
                        {editingId ? "Aggiorna" : "Salva"} Attività
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipi di Lavoro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durata Default</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tariffa Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Interno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities?.map((activity: any) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{activity.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {/* Mostra il tipo principale */}
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                              {getJobTypeName(activity.jobTypeId)}
                            </span>
                            
                            {/* Mostra gli altri tipi */}
                            {(() => {
                              // Estrai gli ID dei tipi di lavoro aggiuntivi
                              let additionalJobTypeIds: number[] = [];
                              
                              try {
                                if (activity.jobTypeIds) {
                                  // Se è una stringa JSON, prova a fare il parsing
                                  if (typeof activity.jobTypeIds === 'string') {
                                    try {
                                      additionalJobTypeIds = JSON.parse(activity.jobTypeIds);
                                    } catch (e) {
                                      console.error("Errore nel parsing dei jobTypeIds:", e);
                                      // Se la stringa contiene virgole, prova a separarla
                                      if (activity.jobTypeIds.includes(',')) {
                                        additionalJobTypeIds = activity.jobTypeIds.split(',').map((s: string) => parseInt(s.trim()));
                                      } else if (activity.jobTypeIds.trim()) {
                                        // Altrimenti è solo un valore singolo
                                        additionalJobTypeIds = [parseInt(activity.jobTypeIds)];
                                      }
                                    }
                                  } else if (Array.isArray(activity.jobTypeIds)) {
                                    // Se è già un array, usalo direttamente
                                    additionalJobTypeIds = activity.jobTypeIds;
                                  }
                                }
                              } catch (e) {
                                console.error("Errore nel recupero dei jobTypeIds:", e);
                              }
                              
                              // Filtra l'ID principale e mostra solo gli altri
                              return additionalJobTypeIds
                                .filter(typeId => typeId !== activity.jobTypeId)
                                .map(typeId => (
                                  <span key={typeId} className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
                                    {getJobTypeName(typeId)}
                                  </span>
                                ));
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{activity.defaultDuration} ore</td>
                        <td className="px-6 py-4 whitespace-nowrap">{activity.defaultRate} €/ora</td>
                        <td className="px-6 py-4 whitespace-nowrap">{activity.defaultCost} €/ora</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditActivity(activity)}
                          >
                            Modifica
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* RUOLI */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Gestione Ruoli</span>
                <Button 
                  onClick={() => {
                    roleForm.reset();
                    setEditingId(null);
                    setShowForm(!showForm);
                  }}
                >
                  {showForm ? "Annulla" : "Nuovo Ruolo"}
                </Button>
              </CardTitle>
              <CardDescription>
                Aggiungi, modifica o elimina ruoli e permessi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onSubmitRole)} className="space-y-4 mb-6">
                    <FormField
                      control={roleForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Ruolo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci nome del ruolo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={roleForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Inserisci una descrizione" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={roleForm.control}
                      name="permissions"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Permessi</FormLabel>
                            <FormDescription>
                              Seleziona i permessi per questo ruolo
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {availablePermissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={roleForm.control}
                                name="permissions"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={permission.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(permission.id)}
                                          onCheckedChange={(checked) => {
                                            // Gestione speciale per "view_all" e "delete_all" - sono mutuamente esclusivi
                                            if (permission.id === "view_all" && checked) {
                                              // Se selezioniamo "view_all", includiamo tutti i permessi tranne "delete_all"
                                              const allPermissions = availablePermissions
                                                .filter(p => p.id !== "delete_all")
                                                .map(p => p.id);
                                              
                                              return field.onChange(allPermissions);
                                            } else if (permission.id === "delete_all" && checked) {
                                              // Se "delete_all" è selezionato, deseleziona "view_all" e seleziona solo "delete_all"
                                              return field.onChange(["delete_all"]);
                                            } else {
                                              // Per gli altri permessi, aggiungi o rimuovi normalmente
                                              return checked
                                                ? field.onChange([...(field.value || []), permission.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== permission.id
                                                    ) || []
                                                  );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {permission.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          roleForm.reset();
                        }}
                      >
                        Annulla
                      </Button>
                      <Button type="submit">
                        {editingId ? "Aggiorna" : "Salva"} Ruolo
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permessi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles?.map((role: any) => (
                      <tr key={role.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                        <td className="px-6 py-4">{role.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && (
                              Array.isArray(role.permissions) ? (
                                role.permissions.map((perm: string) => (
                                  <Badge key={perm} variant="outline" className="text-xs">
                                    {availablePermissions.find(p => p.id === perm)?.label || perm}
                                  </Badge>
                                ))
                              ) : (
                                <span>Nessun permesso</span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            Modifica
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* COLLABORATORI */}
        <TabsContent value="collaborators">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Gestione Collaboratori</span>
                <Button 
                  onClick={() => {
                    collaboratorForm.reset({
                      name: "",
                      username: "",
                      phone: "",
                      email: "",
                      language: "it",
                      workHours: JSON.stringify(defaultWorkHours),
                      roleIds: "",
                      notifyByEmail: true,
                      notifyByWhatsApp: false,
                      notificationTime: 24,
                      isActive: true,
                    });
                    setEditingId(null);
                    setShowForm(!showForm);
                  }}
                >
                  {showForm ? "Annulla" : "Nuovo Collaboratore"}
                </Button>
              </CardTitle>
              <CardDescription>
                Aggiungi, modifica e gestisci i tuoi collaboratori e le loro impostazioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Form {...collaboratorForm}>
                  <form onSubmit={collaboratorForm.handleSubmit(onSubmitCollaborator)} className="space-y-4 mb-6">
                    <FormField
                      control={collaboratorForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Collaboratore *</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci nome del collaboratore" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={collaboratorForm.control}
                      name="roleIds"
                      render={({ field }) => {
                        // Parse roleIds se è una stringa JSON
                        let selectedRoles: string[] = [];
                        try {
                          if (field.value && typeof field.value === 'string') {
                            selectedRoles = JSON.parse(field.value);
                          }
                        } catch (e) {
                          console.error("Errore nel parsing dei roleIds:", e);
                        }
                        
                        return (
                          <FormItem>
                            <FormLabel>Ruoli *</FormLabel>
                            <MultiSelect
                              selected={selectedRoles}
                              options={roles?.map((role: any) => ({
                                  label: role.name,
                                  value: role.id.toString()
                                })) || []}
                              onChange={(selected) => {
                                field.onChange(JSON.stringify(selected));
                              }}
                              placeholder="Seleziona uno o più ruoli"
                            />
                            <FormDescription>
                              Seleziona i ruoli assegnati a questo collaboratore
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={collaboratorForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username *</FormLabel>
                            <FormControl>
                              <Input placeholder="Username per login" {...field} />
                            </FormControl>
                            <FormDescription>
                              Username unico per il login
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={collaboratorForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefono</FormLabel>
                            <FormControl>
                              <Input placeholder="Numero di telefono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collaboratorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Indirizzo email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={collaboratorForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lingua</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona lingua" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="it">Italiano</SelectItem>
                              <SelectItem value="en">Inglese</SelectItem>
                              <SelectItem value="fr">Francese</SelectItem>
                              <SelectItem value="de">Tedesco</SelectItem>
                              <SelectItem value="es">Spagnolo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Lingua preferita del collaboratore
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border p-4 rounded-md space-y-4 mb-4">
                      <h3 className="font-medium">Orari di Lavoro</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={collaboratorForm.control}
                          name="workHours"
                          render={({ field }) => {
                            // Leggi il valore json degli orari di lavoro
                            let workHoursObj = defaultWorkHours;
                            try {
                              if (field.value && typeof field.value === 'string') {
                                const parsedValue = JSON.parse(field.value);
                                if (parsedValue && typeof parsedValue === 'object') {
                                  // Assicuriamoci che ogni giorno abbia una struttura corretta
                                  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                  validDays.forEach(day => {
                                    if (!parsedValue[day] || typeof parsedValue[day] !== 'object') {
                                      parsedValue[day] = { start: "", end: "" };
                                    } else {
                                      // Assicuriamoci che start e end esistano e siano stringhe
                                      parsedValue[day].start = parsedValue[day].start || "";
                                      parsedValue[day].end = parsedValue[day].end || "";
                                    }
                                  });
                                  workHoursObj = parsedValue;
                                }
                              }
                            } catch (e) {
                              console.error("Errore nel parsing degli orari di lavoro:", e);
                            }
                            
                            // Funzione per aggiornare un singolo orario
                            const updateWorkHour = (day: string, type: 'start' | 'end', value: string) => {
                              const updatedWorkHours = {
                                ...workHoursObj,
                                [day]: {
                                  ...workHoursObj[day as keyof typeof workHoursObj],
                                  [type]: value
                                }
                              };
                              field.onChange(JSON.stringify(updatedWorkHours));
                            };
                            
                            return (
                              <FormItem className="col-span-2">
                                <div className="space-y-4">
                                  {Object.entries(workHoursObj).map(([day, hours]) => (
                                    <div key={day} className="grid grid-cols-3 gap-2 items-center">
                                      <div className="font-medium">
                                        {day === 'monday' ? 'Lunedì' : 
                                         day === 'tuesday' ? 'Martedì' : 
                                         day === 'wednesday' ? 'Mercoledì' : 
                                         day === 'thursday' ? 'Giovedì' : 
                                         day === 'friday' ? 'Venerdì' : 
                                         day === 'saturday' ? 'Sabato' : 'Domenica'}
                                      </div>
                                      <div className="relative">
                                        <Input 
                                          type="time" 
                                          value={(hours as {start: string, end: string}).start || ""}
                                          onChange={(e) => updateWorkHour(day, 'start', e.target.value)}
                                          className="pl-16"
                                        />
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                          Inizio:
                                        </div>
                                      </div>
                                      <div className="relative">
                                        <Input 
                                          type="time" 
                                          value={(hours as {start: string, end: string}).end || ""}
                                          onChange={(e) => updateWorkHour(day, 'end', e.target.value)}
                                          className="pl-16"
                                        />
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                          Fine:
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <FormDescription>
                                  Imposta gli orari di lavoro per ogni giorno della settimana
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Il campo hourlyCost è stato rimosso come richiesto */}
                    
                    <div className="border p-4 rounded-md space-y-4">
                      <h3 className="font-medium">Impostazioni di Notifica</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={collaboratorForm.control}
                          name="notifyByEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Notifica via Email</FormLabel>
                                <FormDescription>
                                  Ricevi notifiche via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={collaboratorForm.control}
                          name="notifyByWhatsApp"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Notifica via WhatsApp</FormLabel>
                                <FormDescription>
                                  Ricevi notifiche via WhatsApp
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={collaboratorForm.control}
                        name="notificationTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo di Notifica (ore prima)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="72" 
                                placeholder="Ore prima" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Quanto tempo prima del lavoro inviare la notifica (in ore)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          collaboratorForm.reset();
                        }}
                      >
                        Annulla
                      </Button>
                      <Button type="submit">
                        {editingId ? "Aggiorna" : "Salva"} Collaboratore
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contatti</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orari</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notifiche</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collaborators?.map((collaborator: any) => (
                      <tr key={collaborator.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{collaborator.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {collaborator.roles && collaborator.roles.length > 0 ? (
                              collaborator.roles.map((role: any) => (
                                <Badge key={role.id} variant="outline" className="text-xs">
                                  {role.name}
                                </Badge>
                              ))
                            ) : (
                              // Se non ha ruoli definiti nell'array roles, verifica roleIds
                              collaborator.roleIds ? (
                                (() => {
                                  try {
                                    const roleList = typeof collaborator.roleIds === 'string' 
                                      ? JSON.parse(collaborator.roleIds) 
                                      : collaborator.roleIds;
                                    
                                    return roleList.map((roleId: number) => (
                                      <Badge key={roleId} variant="outline" className="text-xs">
                                        {getRoleName(roleId)}
                                      </Badge>
                                    ));
                                  } catch (e) {
                                    return <span>Ruoli non disponibili</span>;
                                  }
                                })()
                              ) : (
                                // Fallback a roleId se né roles né roleIds sono disponibili (legacy)
                                collaborator.roleId && (
                                  <Badge variant="outline" className="text-xs">
                                    {getRoleName(collaborator.roleId)}
                                  </Badge>
                                )
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{collaborator.phone}</div>
                          <div>{collaborator.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs">
                            {(() => {
                              try {
                                // Tenta di analizzare gli orari di lavoro dal formato JSON
                                let workHoursObj = defaultWorkHours;
                                if (typeof collaborator.workHours === 'string' && collaborator.workHours) {
                                  try {
                                    const parsedValue = JSON.parse(collaborator.workHours);
                                    if (parsedValue && typeof parsedValue === 'object') {
                                      // Assicuriamoci che ogni giorno abbia una struttura corretta
                                      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                      validDays.forEach(day => {
                                        if (!parsedValue[day] || typeof parsedValue[day] !== 'object') {
                                          parsedValue[day] = { start: "", end: "" };
                                        } else {
                                          // Assicuriamoci che start e end esistano e siano stringhe
                                          parsedValue[day].start = parsedValue[day].start || "";
                                          parsedValue[day].end = parsedValue[day].end || "";
                                        }
                                      });
                                      workHoursObj = parsedValue;
                                    }
                                  } catch (e) {
                                    console.error("Errore nel parsing degli orari di lavoro:", e);
                                  }
                                }
                                
                                // Creiamo una lista delle giornate con i rispettivi orari
                                const daysWithHours = Object.entries(workHoursObj)
                                  .filter(([_, hours]) => (hours as {start: string, end: string}).start && (hours as {start: string, end: string}).end)
                                  .map(([day, hours]) => {
                                    const dayName = 
                                      day === 'monday' ? 'Lun' : 
                                      day === 'tuesday' ? 'Mar' : 
                                      day === 'wednesday' ? 'Mer' : 
                                      day === 'thursday' ? 'Gio' : 
                                      day === 'friday' ? 'Ven' : 
                                      day === 'saturday' ? 'Sab' : 'Dom';
                                    
                                    return `${dayName} ${(hours as {start: string, end: string}).start}-${(hours as {start: string, end: string}).end}`;
                                  });
                                
                                return (
                                  <div className="grid grid-cols-2 gap-1">
                                    {daysWithHours.map((dayHours, idx) => (
                                      <div key={idx}>{dayHours}</div>
                                    ))}
                                  </div>
                                );
                              } catch (e) {
                                return <span>Orari non disponibili</span>;
                              }
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            {collaborator.notifyByEmail && <span>Email</span>}
                            {collaborator.notifyByWhatsApp && <span>WhatsApp</span>}
                            <span className="text-xs text-gray-500">
                              {collaborator.notificationTime} ore prima
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCollaborator(collaborator)}
                          >
                            Modifica
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
