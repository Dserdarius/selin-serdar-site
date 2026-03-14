import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";

type Category = "photo" | "movie" | "game";

type ContentItem = {
  id: number;
  category: Category;
  title: string;
  status: string | null;
  note: string;
  image_url: string | null;
  sort_order: number;
  created_at?: string;
};

type SiteSettings = {
  id?: number;
  relationship_start: string;
  welcome_title: string;
  welcome_subtitle: string;
  secret_message: string;
  music_embed_url: string | null;
  map_embed_url: string | null;
};

const FALLBACK_SETTINGS: SiteSettings = {
  relationship_start: "2024-03-15",
  welcome_title: "Hoş geldin Selin ❤️",
  welcome_subtitle: "Bu küçük site sadece bizim için hazırlandı.",
  secret_message:
    "15 Mart 2024'te başlayan bu hikaye hayatımın en güzel hikayesi oldu. Seninle geçen her gün daha değerli.",
  music_embed_url: "https://www.youtube.com/embed/HB_GnnhNz-8",
  map_embed_url:
    "https://maps.google.com/maps?q=Kadir%20Has%20University&t=&z=15&ie=UTF8&iwloc=&output=embed",
};

type PhotoForm = {
  id: number;
  title: string;
  note: string;
  image_url: string;
};

type MediaForm = {
  id: number;
  title: string;
  status: string;
  note: string;
  image_url: string;
};

type HeartItem = {
  id: number;
  x: number;
  y: number;
};

export default function App() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ContentItem | null>(null);
  const [playMusic, setPlayMusic] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [photoForm, setPhotoForm] = useState<PhotoForm>({
    id: 0,
    title: "",
    note: "",
    image_url: "",
  });

  const [movieForm, setMovieForm] = useState<MediaForm>({
    id: 0,
    title: "",
    status: "İzlenecek",
    note: "",
    image_url: "",
  });

  const [gameForm, setGameForm] = useState<MediaForm>({
    id: 0,
    title: "",
    status: "Oynanacak",
    note: "",
    image_url: "",
  });

  const [mouseHearts, setMouseHearts] = useState<HeartItem[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const photoItems = useMemo(
    () =>
      items
        .filter((item) => item.category === "photo")
        .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const movieItems = useMemo(
    () =>
      items
        .filter((item) => item.category === "movie")
        .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const gameItems = useMemo(
    () =>
      items
        .filter((item) => item.category === "game")
        .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const startDate = useMemo(
    () => new Date(settings.relationship_start || "2024-03-15"),
    [settings.relationship_start]
  );

  const daysTogether = Math.max(
    1,
    Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const nextAnniversaryDays = useMemo(() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), 2, 15);
    if (next <= now) next.setFullYear(now.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  async function loadEverything() {
    setLoading(true);
    setError("");

    const [{ data: contentData, error: contentError }, { data: settingsData, error: settingsError }, { data: sessionData }] =
      await Promise.all([
        supabase.from("site_content").select("*").order("sort_order", { ascending: true }),
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.auth.getSession(),
      ]);

    if (contentError) setError(contentError.message);
    if (settingsError) setError(settingsError.message);

    if (contentData) setItems(contentData as ContentItem[]);
    if (settingsData) {
      setSettings({
        relationship_start: settingsData.relationship_start,
        welcome_title: settingsData.welcome_title,
        welcome_subtitle: settingsData.welcome_subtitle,
        secret_message: settingsData.secret_message,
        music_embed_url: settingsData.music_embed_url,
        map_embed_url: settingsData.map_embed_url,
      });
    }

    if (sessionData?.session?.user) {
      setIsAdmin(true);
      if (!adminEmail) {
        setAdminEmail(sessionData.session.user.email || "");
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEverything();

    const timer = setTimeout(() => setShowWelcome(false), 2200);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session?.user);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setNotice("");
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail.trim(),
      password: adminPassword,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setAdminPassword("");
    setIsAdmin(true);
    setNotice("Admin girişi başarılı.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminPassword("");
    setNotice("Çıkış yapıldı.");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.random() > 0.16) return;

    const id = Date.now() + Math.random();
    const heart = { id, x: e.clientX, y: e.clientY };
    setMouseHearts((prev) => [...prev.slice(-14), heart]);

    setTimeout(() => {
      setMouseHearts((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Sadece görsel dosyası yüklenebilir.");
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("anniversary-media")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("anniversary-media").getPublicUrl(path);
    setPhotoForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setNotice("Fotoğraf yüklendi.");
  };

  const resetPhotoForm = () => {
    setPhotoForm({ id: 0, title: "", note: "", image_url: "" });
  };

  const resetMovieForm = () => {
    setMovieForm({
      id: 0,
      title: "",
      status: "İzlenecek",
      note: "",
      image_url: "",
    });
  };

  const resetGameForm = () => {
    setGameForm({
      id: 0,
      title: "",
      status: "Oynanacak",
      note: "",
      image_url: "",
    });
  };

  const saveContent = async (
    category: Category,
    form: { id: number; title: string; note: string; status?: string; image_url: string }
  ) => {
    setError("");
    setNotice("");

    if (!form.title.trim() || !form.note.trim()) {
      setError("Başlık ve not zorunlu.");
      return;
    }

    const sort_order =
      items.filter((item) => item.category === category).length + 1;

    const payload = {
      category,
      title: form.title.trim(),
      status: form.status ? form.status.trim() : null,
      note: form.note.trim(),
      image_url: form.image_url.trim() || null,
      sort_order,
    };

    let dbError = null;

    if (form.id) {
      const { error } = await supabase
        .from("site_content")
        .update(payload)
        .eq("id", form.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("site_content").insert(payload);
      dbError = error;
    }

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setNotice("Kaydedildi.");
    await loadEverything();

    if (category === "photo") resetPhotoForm();
    if (category === "movie") resetMovieForm();
    if (category === "game") resetGameForm();
  };

  const deleteContent = async (id: number) => {
    const { error } = await supabase.from("site_content").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("Silindi.");
    await loadEverything();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #ffe6f0 0%, #fff7fb 40%, #ffffff 100%)",
        minHeight: "100vh",
        color: "#5b2145",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {showWelcome && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(135deg, #ffd6e7, #fff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div>
            <div style={{ fontSize: "60px" }}>💗</div>
            <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
              {settings.welcome_title}
            </h1>
            <p style={{ fontSize: "18px" }}>{settings.welcome_subtitle}</p>
          </div>
        </div>
      )}

      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: `${(i * 7 + 5) % 100}%`,
            bottom: "-30px",
            fontSize: "22px",
            opacity: 0.35,
            animation: `floatHeart ${8 + (i % 5)}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          ❤️
        </div>
      ))}

      {mouseHearts.map((heart) => (
        <div
          key={heart.id}
          style={{
            position: "fixed",
            left: heart.x,
            top: heart.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 999,
            animation: "mouseHeart 1s ease-out forwards",
          }}
        >
          💖
        </div>
      ))}

      <style>
        {`
          @keyframes floatHeart {
            0% { transform: translateY(0); opacity: 0; }
            15% { opacity: 0.35; }
            100% { transform: translateY(-110vh); opacity: 0; }
          }
          @keyframes mouseHeart {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
            100% { opacity: 0; transform: translate(-50%, -100px) scale(1.4); }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <section style={{ textAlign: "center", paddingTop: "30px" }}>
          <h1 style={{ fontSize: "52px", marginBottom: "12px" }}>
            Selin ❤️ Serdar
          </h1>

          <p style={{ fontSize: "24px", marginBottom: "10px" }}>
            15 Mart 2024'ten beri birlikte {daysTogether} gündür
          </p>

          <p style={{ color: "#a64d79", marginBottom: "24px" }}>
            Bir sonraki 15 Mart yıldönümüne {nextAnniversaryDays} gün kaldı ❤️
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setShowMessage(true)}
              style={{
                padding: "12px 20px",
                borderRadius: "999px",
                border: "none",
                background: "#e75480",
                color: "white",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Selin için mesaj 💌
            </button>

            <button
              onClick={() => setPlayMusic((prev) => !prev)}
              style={{
                padding: "12px 20px",
                borderRadius: "999px",
                border: "none",
                background: "#ff8fb1",
                color: "white",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Bizim Şarkımız 🎵
            </button>
          </div>
        </section>

        {playMusic && settings.music_embed_url && (
          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <iframe
              width="320"
              height="180"
              src={settings.music_embed_url}
              title="music"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                border: "none",
                borderRadius: "18px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
            ></iframe>
          </div>
        )}

        <section style={{ marginTop: "50px", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", marginBottom: "18px" }}>
            İlk Buluştuğumuz Yer
          </h2>

          <iframe
            title="Kadir Has Üniversitesi"
            src={settings.map_embed_url || ""}
            style={{
              width: "100%",
              height: "320px",
              border: "none",
              borderRadius: "22px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          ></iframe>
        </section>

        <section style={{ marginTop: "55px" }}>
          <h2 style={{ fontSize: "32px", marginBottom: "18px" }}>
            Fotoğraflarımız
          </h2>

          {isAdmin && (
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "16px",
                marginBottom: "18px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <h3>Fotoğraf Ekle / Düzenle</h3>
              <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                <input
                  placeholder="Başlık"
                  value={photoForm.title}
                  onChange={(e) =>
                    setPhotoForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Not"
                  value={photoForm.note}
                  onChange={(e) =>
                    setPhotoForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Görsel linki"
                  value={photoForm.image_url}
                  onChange={(e) =>
                    setPhotoForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => saveContent("photo", photoForm)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#e75480",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={resetPhotoForm}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {photoItems.map((photo) => (
              <div
                key={photo.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    onClick={() => setSelectedPhoto(photo)}
                    style={{
                      width: "100%",
                      height: "240px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                  />
                ) : null}

                <div style={{ padding: "16px" }}>
                  <h3>{photo.title}</h3>
                  <p style={{ color: "#7a4b68" }}>{photo.note}</p>

                  {isAdmin && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button
                        onClick={() =>
                          setPhotoForm({
                            id: photo.id,
                            title: photo.title,
                            note: photo.note,
                            image_url: photo.image_url || "",
                          })
                        }
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: "1px solid #ccc",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deleteContent(photo.id)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: "1px solid #f3b2c7",
                          background: "#fff0f5",
                          cursor: "pointer",
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "55px" }}>
          <h2 style={{ fontSize: "32px", marginBottom: "18px" }}>
            Film Köşemiz
          </h2>

          {isAdmin && (
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "16px",
                marginBottom: "18px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <h3>Film Ekle / Düzenle</h3>
              <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                <input
                  placeholder="Film adı"
                  value={movieForm.title}
                  onChange={(e) =>
                    setMovieForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Durum"
                  value={movieForm.status}
                  onChange={(e) =>
                    setMovieForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Not"
                  value={movieForm.note}
                  onChange={(e) =>
                    setMovieForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Film fotoğraf linki"
                  value={movieForm.image_url}
                  onChange={(e) =>
                    setMovieForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => saveContent("movie", movieForm)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#e75480",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={resetMovieForm}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {movieItems.map((movie) => (
              <div
                key={movie.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                {movie.image_url ? (
                  <img
                    src={movie.image_url}
                    alt={movie.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : null}

                <div style={{ padding: "16px" }}>
                  <h3>{movie.title}</h3>
                  <p style={{ color: "#a64d79", margin: "6px 0" }}>{movie.status}</p>
                  <p style={{ color: "#7a4b68" }}>{movie.note}</p>

                  {isAdmin && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button
                        onClick={() =>
                          setMovieForm({
                            id: movie.id,
                            title: movie.title,
                            status: movie.status || "",
                            note: movie.note,
                            image_url: movie.image_url || "",
                          })
                        }
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: "1px solid #ccc",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deleteContent(movie.id)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: "1px solid #f3b2c7",
                          background: "#fff0f5",
                          cursor: "pointer",
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "55px" }}>
          <h2 style={{ fontSize: "32px", marginBottom: "18px" }}>
            Oyunlarımız
          </h2>

          {isAdmin && (
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "16px",
                marginBottom: "18px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <h3>Oyun Ekle / Düzenle</h3>
              <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                <input
                  placeholder="Oyun adı"
                  value={gameForm.title}
                  onChange={(e) =>
                    setGameForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Durum"
                  value={gameForm.status}
                  onChange={(e) =>
                    setGameForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Not"
                  value={gameForm.note}
                  onChange={(e) =>
                    setGameForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  placeholder="Oyun fotoğraf linki"
                  value={gameForm.image_url}
                  onChange={(e) =>
                    setGameForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => saveContent("game", gameForm)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#e75480",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={resetGameForm}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {gameItems.map((game) => (
              <div
                key={game.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : null}

                <div style={{ padding: "16px" }}>
                  <h3>{game.title}</h3>
                  <p style={{ color: "#a64d79", margin: "6px 0" }}>{game.status}</p>
                  <p style={{ color: "#7a4b68" }}>{game.note}</p>

                  {isAdmin && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button
                        onClick={() =>
                          setGameForm({
                            id: game.id,
                            title: game.title,
                            status: game.status || "",
                            note: game.note,
                            image_url: game.image_url || "",
                          })
                        }
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: "1px solid #ccc",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deleteContent(game.id)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          border: "1px solid #f3b2c7",
                          background: "#fff0f5",
                          cursor: "pointer",
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "60px" }}>
          <div
            style={{
              background: "white",
              borderRadius: "22px",
              padding: "22px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ fontSize: "30px", marginBottom: "18px" }}>
              Admin Girişi
            </h2>

            {!isAdmin ? (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  maxWidth: "420px",
                  margin: "0 auto",
                }}
              >
                <input
                  placeholder="Admin email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <button
                  onClick={handleLogin}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#e75480",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Giriş Yap
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p>Admin olarak giriş yaptın.</p>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid #ccc",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </section>

        {(notice || error) && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            {notice ? <p style={{ color: "green" }}>{notice}</p> : null}
            {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
          </div>
        )}

        {loading && (
          <p style={{ textAlign: "center", marginTop: "30px" }}>Yükleniyor...</p>
        )}
      </div>

      {showMessage && (
        <div
          onClick={() => setShowMessage(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "520px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Selin ❤️</h2>
            <p style={{ lineHeight: 1.7 }}>{settings.secret_message}</p>
            <button
              onClick={() => setShowMessage(false)}
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                borderRadius: "12px",
                border: "none",
                background: "#e75480",
                color: "white",
                cursor: "pointer",
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: "20px",
          }}
        >
          <img
            src={selectedPhoto.image_url || ""}
            alt={selectedPhoto.title}
            style={{
              maxWidth: "90%",
              maxHeight: "85vh",
              borderRadius: "20px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      )}
    </div>
  );
}