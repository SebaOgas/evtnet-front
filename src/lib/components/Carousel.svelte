<script lang="ts">
    /**
     * Custom Carousel Component
     * Built with assistance from Claude (Anthropic)
     * Features: TypeScript, Tailwind CSS, drag/swipe support, responsive design
     */
    import { onDestroy } from 'svelte';
    
    interface Slide {
        id: number;
        src: string;
    }
    
    export let slides: Slide[] = [];
    export let autoplay: boolean = false;
    export let interval: number = 3000;
    
    let currentIndex: number = 0;
    let intervalId: any = null;
    
    // Drag functionality
    let isDragging: boolean = false;
    let startX: number = 0;
    let dragOffset: number = 0;
    let carouselElement: HTMLDivElement;
    let hasDragged: boolean = false;
    
    function nextSlide(): void {
        currentIndex = (currentIndex + 1) % slides.length;
    }
    
    function prevSlide(): void {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    }
    
    function goToSlide(index: number): void {
        currentIndex = index;
    }
    
    // Drag functions
    function handleDragStart(e: MouseEvent | TouchEvent): void {
        isDragging = true;
        hasDragged = false;
        stopAutoplay();
        
        if (e instanceof MouseEvent) {
            startX = e.clientX;
        } else {
            startX = e.touches[0].clientX;
        }

        dragOffset = 0;
    }
    
    function handleDragMove(e: MouseEvent | TouchEvent): void {
        if (!isDragging) return;
        
        e.preventDefault();
        
        let clientX: number;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
        } else {
            clientX = e.touches[0].clientX;
        }
        
        dragOffset = clientX - startX;
        
        // Mark that we've moved enough to consider it a drag
        if (Math.abs(dragOffset) > 5) {
            hasDragged = true;
        }
    }
    
    function handleDragEnd(): void {
        if (!isDragging || !carouselElement) return;
        
        isDragging = false;
        
        const threshold = carouselElement.offsetWidth * 0.2; // 20% of width
        
        if (Math.abs(dragOffset) > threshold && hasDragged) {
            if (dragOffset > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
        
        dragOffset = 0;
        hasDragged = false;
        
        if (autoplay) {
            startAutoplay();
        }
    }
    
    function handleClick(e: MouseEvent): void {
        // Prevent any action if user was dragging or if we don't have a carousel element
        if (hasDragged || !carouselElement) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    
    function startAutoplay(): void {
        if (autoplay && slides.length > 1) {
            intervalId = setInterval(nextSlide, interval);
        }
    }
    
    function stopAutoplay(): void {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
    
    $: if (slides.length > 0) {
        if (autoplay) {
            startAutoplay();
        }
    }
    
    onDestroy(() => {
        stopAutoplay();
    });
</script>

<div class="relative w-full h-[50vh] overflow-hidden rounded-lg flex-shrink-0">
    {#if slides.length > 0}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="relative w-full h-full">
            <!-- Carousel track -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div 
                bind:this={carouselElement}
                class="flex h-full cursor-grab active:cursor-grabbing"
                class:transition-transform={!isDragging}
                class:duration-300={!isDragging}
                class:ease-in-out={!isDragging}
                style="transform: translateX({-currentIndex * 100 + (isDragging && carouselElement ? (dragOffset / carouselElement.offsetWidth) * 100 : 0)}%)"
                on:mousedown={handleDragStart}
                on:mousemove={handleDragMove}
                on:mouseup={handleDragEnd}
                on:mouseleave={handleDragEnd}
                on:touchstart={handleDragStart}
                on:touchmove={handleDragMove}
                on:touchend={handleDragEnd}
                on:click={handleClick}
                role="region"
                aria-label="Image carousel"
            >
                {#each slides as slide, index}
                    <div class="flex-shrink-0 w-full h-full flex items-center justify-center p-2">
                        <img 
                            src={slide.src} 
                            alt="Slide {index + 1}"
                            class="max-w-full max-h-full object-contain select-none"
                            loading="lazy"
                            draggable="false"
                        />
                    </div>
                {/each}
            </div>
            
            <!-- Navigation arrows -->
            {#if slides.length > 1}
                <button 
                    class="absolute top-1/2 left-2 transform -translate-y-1/2 text-white border-none p-2 px-3 cursor-pointer text-2xl rounded z-10 transition-all duration-200"
                    style="background-color: rgba(0, 178, 202, 0.8);"
                    on:mouseenter={(e) => {
                        const target = e.target as HTMLElement;
                        if (target) target.style.backgroundColor = 'rgba(0, 178, 202, 1)';
                    }}
                    on:mouseleave={(e) => {
                        const target = e.target as HTMLElement;
                        if (target) target.style.backgroundColor = 'rgba(0, 178, 202, 0.8)';
                    }}
                    on:click={prevSlide}
                    aria-label="Previous slide"
                >
                    ‹
                </button>
                <button 
                    class="absolute top-1/2 right-2 transform -translate-y-1/2 text-white border-none p-2 px-3 cursor-pointer text-2xl rounded z-10 transition-all duration-200"
                    style="background-color: rgba(0, 178, 202, 0.8);"
                    on:mouseenter={(e) => {
                        const target = e.target as HTMLElement;
                        if (target) target.style.backgroundColor = 'rgba(0, 178, 202, 1)';
                    }}
                    on:mouseleave={(e) => {
                        const target = e.target as HTMLElement;
                        if (target) target.style.backgroundColor = 'rgba(0, 178, 202, 0.8)';
                    }}
                    on:click={nextSlide}
                    aria-label="Next slide"
                >
                    ›
                </button>
            {/if}
            
            <!-- Dots indicator -->
            {#if slides.length > 1}
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {#each slides as _, index}
                        <button 
                            class="w-3 h-3 rounded-full border-none cursor-pointer transition-all duration-200 {index === currentIndex ? '' : 'bg-white bg-opacity-50 hover:bg-opacity-70'}"
                            style={index === currentIndex ? 'background-color: #00b2ca; transform: scale(150%)' : 'background-color: #1d4389;'}
                            on:click={() => goToSlide(index)}
                            aria-label="Go to slide {index + 1}"
                        ></button>
                    {/each}
                </div>
            {/if}
        </div>
    {:else}
        <div class="w-full h-full flex items-center justify-center text-gray-600 italic">
            No hay imágenes disponibles
        </div>
    {/if}
</div>