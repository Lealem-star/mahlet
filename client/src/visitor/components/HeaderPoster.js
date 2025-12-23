import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import { getImageUrl } from '../../utils/imageUrl';

const HeaderPoster = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState({ left: null, right: null });
    const [loading, setLoading] = useState(true);
    const [videoErrors, setVideoErrors] = useState({ left: false, right: false });

    // Helper function to check if URL is YouTube
    const isYouTubeUrl = (url) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Helper function to convert YouTube URL to embed format
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';

        // Handle youtu.be short links
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&modestbranding=1&rel=0`;
        }

        // Handle youtube.com/watch?v= links
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&modestbranding=1&rel=0`;
            }
        }

        // Handle youtube.com/embed/ links (already in embed format)
        if (url.includes('youtube.com/embed/')) {
            const videoId = url.split('embed/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&modestbranding=1&rel=0`;
        }

        return url;
    };

    // Handle video error
    const handleVideoError = (position) => {
        console.error(`HeaderPoster: Video failed to load for ${position} position`);
        setVideoErrors(prev => ({ ...prev, [position]: true }));
    };

    // Render video component based on URL type
    const renderVideo = (position, videoUrl) => {
        if (!videoUrl) return null;

        if (isYouTubeUrl(videoUrl)) {
            // Render YouTube iframe
            const embedUrl = getYouTubeEmbedUrl(videoUrl);
            return (
                <iframe
                    key={embedUrl}
                    src={embedUrl}
                    className="w-full h-full object-cover"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`${position} video`}
                    onError={() => {
                        console.error(`${position} YouTube video error`);
                        handleVideoError(position);
                    }}
                />
            );
        } else {
            // Render regular video element for uploaded files
            return (
                <video
                    key={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error(`${position} video error:`, e);
                        handleVideoError(position);
                    }}
                    onLoadStart={() => console.log(`${position} video loading:`, videoUrl)}
                    onCanPlay={() => console.log(`${position} video can play:`, videoUrl)}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            );
        }
    };

    // Fetch images and videos from API
    const fetchData = useCallback(async () => {
        try {
            // Fetch images
            const imagesResponse = await api.get('/api/header-poster/images');
            if (imagesResponse.data && imagesResponse.data.length > 0) {
                const imageUrls = imagesResponse.data.map(img => getImageUrl(img.imageUrl));
                setImages(imageUrls);
            } else {
                setImages([]);
            }

            // Fetch videos
            const videosResponse = await api.get('/api/header-poster/videos');
            console.log('HeaderPoster API response:', videosResponse.data);
            if (videosResponse.data && videosResponse.data.length > 0) {
                const videosObj = {};
                videosResponse.data.forEach(video => {
                    // Ensure the video URL is properly formatted
                    let videoUrl = video.videoUrl;

                    if (!videoUrl) {
                        return; // Skip if no URL
                    }

                    // If it's a YouTube URL, keep it as is (don't modify)
                    if (isYouTubeUrl(videoUrl)) {
                        videosObj[video.position] = videoUrl;
                        console.log(`HeaderPoster: Setting ${video.position} video to:`, videoUrl, `(Type: YouTube)`);
                    } else {
                        // For uploaded files or other relative URLs, use getImageUrl to prepend API base URL
                        // This ensures relative paths like /uploads/videos/... get the correct base URL
                        const processedUrl = getImageUrl(videoUrl);
                        videosObj[video.position] = processedUrl;
                        console.log(`HeaderPoster: Setting ${video.position} video to:`, processedUrl, `(Type: Uploaded file)`);
                    }
                });
                setVideos(videosObj);
                console.log('HeaderPoster videos loaded:', videosObj);
            } else {
                console.log('HeaderPoster: No videos found in database, using fallback');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Refresh data every 30 seconds to get updates
        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchData]);

    // Auto-rotate images every 3 seconds (only if images exist)
    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    // Handle indicator click
    const handleIndicatorClick = (index) => {
        setCurrentImageIndex(index);
    };

    return (
        <div className="w-full bg-transparent relative z-[1000]">
            <div className="flex w-full h-[100px] overflow-hidden md:flex-row flex-col md:h-[100px] h-[75px] gap-2 md:gap-4">
                {/* Left Video */}
                <div className="flex-1 relative overflow-hidden hidden md:block">
                    {videoErrors.left ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <p className="text-amber-400 text-sm">Video unavailable</p>
                        </div>
                    ) : videos.left ? (
                        renderVideo('left', videos.left)
                    ) : (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-amber-400 text-sm">
                            No video
                        </div>
                    )}
                </div>

                {/* Center Images Carousel */}
                <div className="flex-1 relative overflow-hidden bg-transparent md:flex-1 flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-white text-xl">Loading images...</div>
                    ) : images.length > 0 ? (
                        <>
                            <div className="relative w-full h-full">
                                {images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Advertisement ${index + 1}`}
                                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors duration-300 ${index === currentImageIndex
                                            ? 'bg-white'
                                            : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                        onClick={() => handleIndicatorClick(index)}
                                    ></span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-white text-xl">No images available</div>
                    )}
                </div>

                {/* Right Video */}
                <div className="flex-1 relative overflow-hidden hidden md:block">
                    {videoErrors.right ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <p className="text-amber-400 text-sm">Video unavailable</p>
                        </div>
                    ) : videos.right ? (
                        renderVideo('right', videos.right)
                    ) : (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-amber-400 text-sm">
                            No video
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeaderPoster;

