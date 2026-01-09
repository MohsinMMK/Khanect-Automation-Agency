import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Check if WebGL is supported
function isWebGLSupported(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch {
        return false;
    }
}

interface DottedSurfaceProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
    /** Reduce particles on mobile for performance */
    optimizeForMobile?: boolean;
    /** Use brand colors (teal) instead of neutral */
    useBrandColors?: boolean;
    /** Opacity of the dots (0-1) */
    dotOpacity?: number;
    /** Size of the dots */
    dotSize?: number;
}

export function DottedSurface({
    className,
    children,
    optimizeForMobile = true,
    useBrandColors = true,
    dotOpacity = 0.6,
    dotSize = 6,
    ...props
}: DottedSurfaceProps) {
    const { resolvedTheme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const animationIdRef = useRef<number>(0);
    const isCleanedUpRef = useRef<boolean>(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [webGLSupported, setWebGLSupported] = useState(true);
    const [webGLError, setWebGLError] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Check for WebGL support
    useEffect(() => {
        setWebGLSupported(isWebGLSupported());
    }, []);

    useEffect(() => {
        if (!containerRef.current || !webGLSupported) return;

        isCleanedUpRef.current = false;
        const container = containerRef.current;

        // Declare refs for cleanup
        let renderer: THREE.WebGLRenderer | null = null;
        let geometry: THREE.BufferGeometry | null = null;
        let material: THREE.PointsMaterial | null = null;
        let handleResize: (() => void) | null = null;

        try {
            // Responsive particle count
            const isMobile = optimizeForMobile && window.innerWidth < 768;
            const SEPARATION = isMobile ? 200 : 150;
            const AMOUNTX = isMobile ? 25 : 40;
            const AMOUNTY = isMobile ? 35 : 60;

            // Scene setup
            const scene = new THREE.Scene();

            // Camera positioned for better wave visibility
            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                10000,
            );
            camera.position.set(0, 400, 800);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: !isMobile,
                powerPreference: 'high-performance',
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);

            container.appendChild(renderer.domElement);

            // Create geometry for all particles
            geometry = new THREE.BufferGeometry();
            const positions: number[] = [];
            const colors: number[] = [];

            // Brand colors: Teal (#14B8A6) = rgb(20, 184, 166)
            // Lime (#D3F36B) = rgb(211, 243, 107)
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                    const y = 0;
                    const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                    positions.push(x, y, z);

                    if (useBrandColors) {
                        const t = (ix + iy) / (AMOUNTX + AMOUNTY);
                        if (resolvedTheme === 'oak') {
                            const r = 60 / 255 + t * (74 - 60) / 255;
                            const g = 36 / 255 + t * (48 - 36) / 255;
                            const b = 21 / 255 + t * (32 - 21) / 255;
                            colors.push(r, g, b);
                        } else if (resolvedTheme === 'dark') {
                            const r = 20 / 255 + t * (211 - 20) / 255;
                            const g = 184 / 255 + t * (243 - 184) / 255;
                            const b = 166 / 255 + t * (107 - 166) / 255;
                            colors.push(r, g, b);
                        } else {
                            const r = (20 / 255 + t * (180 - 20) / 255) * 0.7;
                            const g = (184 / 255 + t * (200 - 184) / 255) * 0.7;
                            const b = (166 / 255 + t * (80 - 166) / 255) * 0.7;
                            colors.push(r, g, b);
                        }
                    } else {
                        if (resolvedTheme === 'dark') {
                            colors.push(0.7, 0.7, 0.7);
                        } else {
                            colors.push(0.3, 0.3, 0.3);
                        }
                    }
                }
            }

            geometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(positions, 3),
            );
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            // Create material
            material = new THREE.PointsMaterial({
                size: dotSize,
                vertexColors: true,
                transparent: true,
                opacity: dotOpacity,
                sizeAttenuation: true,
            });

            // Create points object
            const points = new THREE.Points(geometry, material);
            scene.add(points);

            let count = 0;
            const animationSpeed = prefersReducedMotion ? 0.02 : 0.08;

            // Capture renderer for closure
            const rendererRef = renderer;
            const geometryRef = geometry;

            // Animation function
            const animate = () => {
                if (isCleanedUpRef.current) return;

                animationIdRef.current = requestAnimationFrame(animate);

                const positionAttribute = geometryRef.attributes.position;
                const posArray = positionAttribute.array as Float32Array;

                let i = 0;
                for (let ix = 0; ix < AMOUNTX; ix++) {
                    for (let iy = 0; iy < AMOUNTY; iy++) {
                        const index = i * 3;
                        posArray[index + 1] =
                            Math.sin((ix + count) * 0.3) * 40 +
                            Math.sin((iy + count) * 0.4) * 40;
                        i++;
                    }
                }

                positionAttribute.needsUpdate = true;
                rendererRef.render(scene, camera);
                count += animationSpeed;
            };

            // Handle window resize
            handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                rendererRef.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);

            // Start animation
            animate();
        } catch (error) {
            console.error('WebGL initialization failed:', error);
            setWebGLError(true);
        }

        // Cleanup function
        return () => {
            isCleanedUpRef.current = true;
            if (handleResize) {
                window.removeEventListener('resize', handleResize);
            }
            cancelAnimationFrame(animationIdRef.current);

            if (geometry) geometry.dispose();
            if (material) material.dispose();
            if (renderer) {
                renderer.dispose();
                if (container && renderer.domElement.parentNode === container) {
                    container.removeChild(renderer.domElement);
                }
            }
        };
    }, [resolvedTheme, prefersReducedMotion, optimizeForMobile, useBrandColors, dotOpacity, dotSize, webGLSupported]);

    // Show CSS fallback if WebGL is not supported or failed
    const showFallback = !webGLSupported || webGLError;

    // Get fallback gradient colors based on theme
    const getFallbackGradient = () => {
        if (resolvedTheme === 'oak') {
            return 'radial-gradient(ellipse at center, rgba(60,36,21,0.3) 0%, transparent 70%)';
        } else if (resolvedTheme === 'dark') {
            return 'radial-gradient(ellipse at center, rgba(20,184,166,0.15) 0%, transparent 70%)';
        }
        return 'radial-gradient(ellipse at center, rgba(20,184,166,0.1) 0%, transparent 70%)';
    };

    return (
        <div
            ref={containerRef}
            className={cn('pointer-events-none absolute inset-0 -z-10', className)}
            aria-hidden="true"
            style={showFallback ? { background: getFallbackGradient() } : undefined}
            {...props}
        >
            {children}
        </div>
    );
}
