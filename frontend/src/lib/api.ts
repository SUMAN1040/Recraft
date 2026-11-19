const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface GenerationResponse {
  id: string;
  prompt: string;
  negative_prompt: string;
  style_preset: string;
  aspect_ratio: string;
  palette_colors: string[];
  status: string;
  image_url: string;
  svg_data: string;
  svg_url?: string;
  content_hash: string;
  prompt_hash: string;
  oracle_signature: string;
  model_version: string;
  error_message?: string;
  created_at: string;
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  palette: string[];
  tag: string;
}

export const api = {
  // AI generation
  async generateArtwork(payload: {
    prompt: string;
    style_preset: string;
    aspect_ratio?: string;
    palette_colors?: string[];
    negative_prompt?: string;
    provider?: string;
  }): Promise<GenerationResponse> {
    const res = await fetch(`${API_BASE_URL}/ai/generate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate artwork");
    }
    return res.json();
  },

  async getStyles(): Promise<{ styles: StyleOption[]; aspect_ratios: string[] }> {
    const res = await fetch(`${API_BASE_URL}/ai/styles/`);
    if (!res.ok) throw new Error("Failed to load styles");
    return res.json();
  },

  async vectorizeImage(file: File, colors = 6): Promise<{ success: boolean; svg_code: string }> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("colors", colors.toString());

    const res = await fetch(`${API_BASE_URL}/ai/vectorize/`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Vectorization failed");
    return res.json();
  },

  // Security & Provenance
  async getOracleSignature(payload: {
    user_address: string;
    image_hash: string;
    prompt_hash: string;
    style_preset: string;
    model_version?: string;
    nonce?: number;
  }) {
    const res = await fetch(`${API_BASE_URL}/security/oracle-signature/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to get oracle signature");
    return res.json();
  },

  async verifyArtwork(payload: { hash?: string; svg?: string; file?: File }) {
    if (payload.file) {
      const formData = new FormData();
      formData.append("file", payload.file);
      const res = await fetch(`${API_BASE_URL}/security/verify/`, {
        method: "POST",
        body: formData,
      });
      return res.json();
    } else {
      const res = await fetch(`${API_BASE_URL}/security/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    }
  },

  async recordMint(payload: {
    content_hash: string;
    prompt_hash: string;
    creator_address: string;
    style_preset: string;
    token_id?: number;
    transaction_hash?: string;
    oracle_signature: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/security/record-mint/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Projects & Canvas
  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/canvas/projects/`);
    return res.json();
  },

  async createProject(title: string) {
    const res = await fetch(`${API_BASE_URL}/canvas/projects/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    return res.json();
  },
};
