import { IStorageProvider } from '../interfaces/IStorageProvider';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorageProvider implements IStorageProvider {
  private supa: SupabaseClient;
  private bucket: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    this.bucket = process.env.STORAGE_BUCKET_NAME || 'whatsapp-media';
    
    this.supa = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const { data, error } = await this.supa.storage
      .from(this.bucket)
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error('[Storage Error]', error);
      throw new Error(`Error en Supabase Upload: ${error.message}`);
    }

    return data.path; // Retorna solo el path interno, ej: "123-bot/audio-xyz.ogg"
  }

  async getSignedUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string> {
    const { data, error } = await this.supa.storage
      .from(this.bucket)
      .createSignedUrl(storagePath, expiresInSeconds);
      
    if (error || !data) {
      console.error('[Storage SignedURL Error]', error);
      return '';
    }
    return data.signedUrl;
  }
}
