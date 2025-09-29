import { Router } from "express";
import { storage } from "../../storage";
import { insertPromotionalSpotSchema } from "../../../shared/schema";
import { z } from "zod";

const router = Router();

// Ottieni tutti gli Spot promozionali
router.get("/", async (req, res) => {
  try {
    const spots = await storage.getPromotionalSpots();
    res.json(spots);
  } catch (error) {
    console.error("Errore nel recupero degli spot promozionali:", error);
    res.status(500).json({ error: "Errore nel recupero degli spot promozionali" });
  }
});

// Ottieni gli Spot promozionali attivi
router.get("/active", async (req, res) => {
  try {
    const spots = await storage.getActivePromotionalSpots();
    res.json(spots);
  } catch (error) {
    console.error("Errore nel recupero degli spot promozionali attivi:", error);
    res.status(500).json({ error: "Errore nel recupero degli spot promozionali attivi" });
  }
});

// Ottieni un singolo Spot promozionale
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID non valido" });
    }
    
    const spot = await storage.getPromotionalSpot(id);
    if (!spot) {
      return res.status(404).json({ error: "Spot promozionale non trovato" });
    }
    
    res.json(spot);
  } catch (error) {
    console.error("Errore nel recupero dello spot promozionale:", error);
    res.status(500).json({ error: "Errore nel recupero dello spot promozionale" });
  }
});

// Crea un nuovo Spot promozionale
router.post("/", async (req, res) => {
  try {
    console.log("Ricevuta richiesta POST per nuovo spot promozionale:", JSON.stringify(req.body, null, 2));
    
    // Trasforma le immagini da stringa a array se necessario
    if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = req.body.images.split(',').map((img: any) => img.trim());
    }
    
    // Converte visiblePages in formato corretto
    if (req.body.visiblePages && Array.isArray(req.body.visiblePages) && req.body.visiblePages.length === 0) {
      req.body.visiblePages = "all";
    }
    
    console.log("Dati spot promozionale processati:", JSON.stringify(req.body, null, 2));
    
    // Converte le date da stringa a oggetto Date
    if (req.body.startDate && typeof req.body.startDate === 'string') {
      req.body.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate && typeof req.body.endDate === 'string') {
      req.body.endDate = new Date(req.body.endDate);
    }
    
    const result = insertPromotionalSpotSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Validazione fallita:", result.error.format());
      return res.status(400).json({ 
        error: "Dati non validi", 
        details: result.error.format() 
      });
    }
    
    console.log("Dati spot promozionale validati, creazione in corso...");
    
    const newSpot = await storage.createPromotionalSpot(result.data);
    console.log("Nuovo spot promozionale creato:", newSpot);
    
    res.status(201).json(newSpot);
  } catch (error) {
    console.error("Errore nella creazione dello spot promozionale:", error);
    res.status(500).json({ error: "Errore nella creazione dello spot promozionale" });
  }
});

// Aggiorna uno Spot promozionale
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID non valido" });
    }
    
    console.log(`Ricevuta richiesta PATCH per spot ID ${id}:`, JSON.stringify(req.body, null, 2));
    
    // Ottieni lo spot esistente per verificare che esista
    const existingSpot = await storage.getPromotionalSpot(id);
    if (!existingSpot) {
      return res.status(404).json({ error: "Spot promozionale non trovato" });
    }
    
    // Trasforma le immagini da stringa a array se necessario
    if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = req.body.images.split(',').map((img: any) => img.trim());
    }
    
    // Converte visiblePages in formato corretto
    if (req.body.visiblePages && Array.isArray(req.body.visiblePages) && req.body.visiblePages.length === 0) {
      req.body.visiblePages = "all";
    }
    
    console.log("Dati spot promozionale processati per aggiornamento:", JSON.stringify(req.body, null, 2));
    
    // Converte le date da stringa a oggetto Date
    if (req.body.startDate && typeof req.body.startDate === 'string') {
      req.body.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate && typeof req.body.endDate === 'string') {
      req.body.endDate = new Date(req.body.endDate);
    }
    
    // Validazione parziale - consente aggiornamenti parziali
    const spotSchema = insertPromotionalSpotSchema.partial();
    const result = spotSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Validazione aggiornamento fallita:", result.error.format());
      return res.status(400).json({ 
        error: "Dati non validi", 
        details: result.error.format() 
      });
    }
    
    console.log("Dati spot promozionale validati, aggiornamento in corso...");
    
    const updatedSpot = await storage.updatePromotionalSpot(id, result.data);
    console.log("Spot promozionale aggiornato:", updatedSpot);
    
    res.json(updatedSpot);
  } catch (error) {
    console.error("Errore nell'aggiornamento dello spot promozionale:", error);
    res.status(500).json({ error: "Errore nell'aggiornamento dello spot promozionale" });
  }
});

// Elimina uno Spot promozionale
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID non valido" });
    }
    
    // Ottieni lo spot esistente per verificare che esista
    const existingSpot = await storage.getPromotionalSpot(id);
    if (!existingSpot) {
      return res.status(404).json({ error: "Spot promozionale non trovato" });
    }
    
    const success = await storage.deletePromotionalSpot(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: "Errore nell'eliminazione dello spot promozionale" });
    }
  } catch (error) {
    console.error("Errore nell'eliminazione dello spot promozionale:", error);
    res.status(500).json({ error: "Errore nell'eliminazione dello spot promozionale" });
  }
});

export default router;