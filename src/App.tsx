import { useEffect, useMemo, useRef, useState } from "react";

type PhotoItem = {
  id: number;
  title: string;
  note: string;
  image: string;
};

type MediaItem = {
  id: number;
  title: string;
  status: string;
  note: string;
  image: string;
};

type HeartItem = {
  id: number;
  x: number;
  y: number;
};

const ADMIN_EMAIL = "serdarumutduman@gmail.com";
const ADMIN_PASSWORD = "SelinSerdar4ever<3";

const defaultPhotos: PhotoItem[] = [
  {
    id: 1,
    title: "En sevdiğim kare",
    note: "Buraya en sevdiğin fotoğraf notunu yazabilirsin.",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
  },
];

const defaultMovies: MediaItem[] = [
  {
    id: 1,
    title: "La La Land",
    status: "İzledik",
    note: "Birlikte izlediğimiz güzel bir film.",
    image: "",
  },
];

const defaultGames: MediaItem[] = [
  {
    id: 1,
    title: "It Takes Two",
    status: "Oynadık",
    note: "Birlikte oynadığımız en tatlı oyunlardan biri.",
    image: "",
  },
];

export default function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>(defaultPhotos);
  const [movies, setMovies] = useState<MediaItem[]>(defaultMovies);
  const [games, setGames] = useState<MediaItem[]>(defaultGames);

  const [showMessage, setShowMessage] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [playMusic, setPlayMusic] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [photoForm, setPhotoForm] = useState<PhotoItem>({
    id: 0,
    title: "",
    note: "",
    image: "",
  });

  const [movieForm, setMovieForm] = useState<MediaItem>({
    id: 0,
    title: "",
    status: "İzlenecek",
    note: "",
    image: "",
  });

  const [gameForm, setGameForm] = useState<MediaItem>({
    id: 0,
    title: "",
    status: "Oynanacak",
    note: "",
    image: "",
  });

  const [mouseHearts, setMouseHearts] = useState<HeartItem[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const startDate = useMemo(() => new Date("2024-03-15"), []);
  const today = new Date();

  const daysTogether = Math.max(
    1,
    Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const nextAnniversaryDays = useMemo(() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), 2, 15);
    if (next <= now) {
      next.setFullYear(now.getFullYear() + 1);
    }
    return Math.ceil(
      (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }, []);

  useEffect(() => {
    const savedPhotos = localStorage.getItem("ss-photos");
    const savedMovies = localStorage.getItem("ss-movies");
    const savedGames = localStorage.getItem("ss-games");

    if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
    if (savedMovies) setMovies(JSON.parse(savedMovies));
    if (savedGames) setGames(JSON.parse(savedGames));

    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("ss-photos", JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem("ss-movies", JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem("ss-games", JSON.stringify(games));
  }, [games]);

  const handleLogin = () => {
    if (
      adminEmail.trim().toLowerCase() === ADMIN_EMAIL &&
      adminPassword === ADMIN_PASSWORD
    ) {
      setIsAdmin(true);
      setAdminError("");
      setAdminPassword("");
    } else {
      setAdminError("Email veya şifre yanlış.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminPassword("");
    setAdminError("");
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoForm((prev) => ({
        ...prev,
        image: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetPhotoForm = () => {
    setPhotoForm({
      id: 0,
      title: "",
      note: "",
      image: "",
    });
  };

  const resetMovieForm = () => {
    setMovieForm({
      id: 0,
      title: "",
      status: "İzlenecek",
      note: "",
      image: "",
    });
  };

  const resetGameForm = () => {
    setGameForm({
      id: 0,
      title: "",
      status: "Oynanacak",
      note: "",
      image: "",
    });
  };

  const savePhoto = () => {
    if (!photoForm.title.trim() || !photoForm.note.trim()) return;

    if (photoForm.id) {
      setPhotos((prev) =>
        prev.map((item) => (item.id === photoForm.id ? photoForm : item))
      );
    } else {
      setPhotos((prev) => [
        ...prev,
        {
          ...photoForm,
          id: Date.now(),
        },
      ]);
    }

    resetPhotoForm();
  };

  const saveMovie = () => {
    if (!movieForm.title.trim() || !movieForm.note.trim()) return;

    if (movieForm.id) {
      setMovies((prev) =>
        prev.map((item) => (item.id === movieForm.id ? movieForm : item))
      );
    } else {
      setMovies((prev) => [
        ...prev,
        {
          ...movieForm,
          id: Date.now(),
        },
      ]);
    }

    resetMovieForm();
  };

  const saveGame = () => {
    if (!gameForm.title.trim() || !gameForm.note.trim()) return;

    if (gameForm.id) {
      setGames((prev) =>
        prev.map((item) => (item.id === gameForm.id ? gameForm : item))
      );
    } else {
      setGames((prev) => [
        ...prev,
        {
          ...gameForm,
          id: Date.now(),
        },
      ]);
    }

    resetGameForm();
  };

  const removePhoto = (id: number) => {
    setPhotos((prev) => prev.filter((item) => item.id !== id));
  };

  const removeMovie = (id: number) => {
    setMovies((prev) => prev.filter((item) => item.id !== id));
  };

  const removeGame = (id: number) => {
    setGames((prev) => prev.filter((item) => item.id !== id));
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
              Hoş geldin Selin ❤️
            </h1>
            <p style={{ fontSize: "18px" }}>
              Bu küçük site sadece bizim için hazırlandı.
            </p>
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
            0% {
              transform: translateY(0);
              opacity: 0;
            }
            15% {
              opacity: 0.35;
            }
            100% {
              transform: translateY(-110vh);
              opacity: 0;
            }
          }

          @keyframes mouseHeart {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0.8);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -100px) scale(1.4);
            }
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

        {playMusic && (
          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <iframe
              width="320"
              height="180"
              src="https://www.youtube.com/embed/HB_GnnhNz-8"
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
            src="https://maps.google.com/maps?q=Kadir%20Has%20University&t=&z=15&ie=UTF8&iwloc=&output=embed"
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
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
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
                  value={photoForm.image}
                  onChange={(e) =>
                    setPhotoForm((prev) => ({ ...prev, image: e.target.value }))
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
                    onClick={savePhoto}
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
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                {photo.image ? (
                  <img
                    src={photo.image}
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
                        onClick={() => setPhotoForm(photo)}
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
                        onClick={() => removePhoto(photo.id)}
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
                  value={movieForm.image}
                  onChange={(e) =>
                    setMovieForm((prev) => ({ ...prev, image: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={saveMovie}
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
            {movies.map((movie) => (
              <div
                key={movie.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                {movie.image ? (
                  <img
                    src={movie.image}
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
                        onClick={() => setMovieForm(movie)}
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
                        onClick={() => removeMovie(movie.id)}
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
                  value={gameForm.image}
                  onChange={(e) =>
                    setGameForm((prev) => ({ ...prev, image: e.target.value }))
                  }
                  style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
                />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={saveGame}
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
            {games.map((game) => (
              <div
                key={game.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                {game.image ? (
                  <img
                    src={game.image}
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
                        onClick={() => setGameForm(game)}
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
                        onClick={() => removeGame(game.id)}
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

                {adminError && (
                  <p style={{ color: "crimson", margin: 0 }}>{adminError}</p>
                )}
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
            <p style={{ lineHeight: 1.7 }}>
              15 Mart 2024'te başlayan bu hikaye hayatımın en güzel
              hikayesi oldu. Seninle geçen her gün daha değerli.
            </p>
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
            src={selectedPhoto.image}
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