import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Music, Disc3, LogOut, ArrowLeft, Trash } from "lucide-react";
import RetroMusicPlayer from "@/components/RetroMusicPlayer";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface Playlist {
  id: string;
  name: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data, error } = await supabase
          .from("playlists")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPlaylists(data || []);
      } catch (error: any) {
        toast({
          title: "Error loading playlists",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [toast]);

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleCreatePlaylist = async () => {
    const playlistName = prompt("Enter playlist name:");
    if (!playlistName) return;

    try {
      const { data, error } = await supabase
        .from("playlists")
        .insert([{ name: playlistName, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Playlist created",
        description: `"${playlistName}" has been added to your library.`,
      });

      setPlaylists([data, ...playlists]);
    } catch (error: any) {
      toast({
        title: "Error creating playlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add a delete playlist handler
  const handleDeletePlaylist = async (id: string, name: string) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("playlists").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Playlist deleted",
        description: `"${name}" has been removed from your library.`,
      });

      setPlaylists(playlists.filter((playlist) => playlist.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting playlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const navigate = useNavigate();
  const handleNavigateBack = () => {
    navigate("/explore");
  };

  return (
    <div className="min-h-screen py-8 px-4 relative crt-overlay">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Link to="/">
            <h1 className="text-3xl md:text-4xl font-pixel text-retro-brown-3 mb-2">
              LOOPORIA
            </h1>
          </Link>
          <p className="font-retro text-xl text-retro-brown-2">
            Welcome back, {user?.email}
            <span className="animate-blink inline-block ml-1">|</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={handleNavigateBack}
            className="retro-btn px-2 py-1 flex items-center"
            aria-label="Back to Explore"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span className="font-pixel text-xs">BACK</span>
          </button>
          <Button
            className="retro-btn flex items-center gap-2"
            onClick={handleCreatePlaylist}
          >
            <Plus size={16} />
            <span>NEW PLAYLIST</span>
          </Button>
          <Button
            className="retro-btn flex items-center gap-2"
            onClick={signOut}
          >
            <LogOut size={16} />
            <span>LOGOUT</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-pixel text-retro-brown-3 mb-4 flex items-center">
            <Disc3 className="mr-2" />
            MY PLAYLISTS
          </h2>

          {loading ? (
            <div className="bg-retro-beige retro-border p-6 text-center">
              <p className="font-retro text-xl text-retro-brown-2">
                Loading playlists...
              </p>
            </div>
          ) : playlists.length === 0 ? (
            <div className="bg-retro-beige retro-border p-6 text-center">
              <p className="font-retro text-xl text-retro-brown-2 mb-4">
                You don't have any playlists yet.
              </p>
              <Button className="retro-btn" onClick={handleCreatePlaylist}>
                CREATE YOUR FIRST PLAYLIST
              </Button>
            </div>
          ) : (
            <div className="bg-retro-beige retro-border p-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-3 border-b border-retro-tan-2 last:border-b-0 hover:bg-retro-tan-1"
                >
                  <div className="flex items-center cursor-pointer">
                    <Music className="mr-3 text-retro-brown-3" size={20} />
                    <div>
                      <h3 className="font-retro text-lg text-retro-brown-3">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-retro-brown-2">
                        Created{" "}
                        {new Date(playlist.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-retro-brown-2 hover:text-retro-brown-3 hover:bg-retro-tan-2"
                    onClick={() =>
                      handleDeletePlaylist(playlist.id, playlist.name)
                    }
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-pixel text-retro-brown-3 mb-4">
            NOW PLAYING
          </h2>
          <RetroMusicPlayer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
