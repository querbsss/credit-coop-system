#!/usr/bin/env python3
"""Simple WCAG contrast checker for the landing-page hero gradient.

This script compares candidate text colors (including semi-transparent whites)
against both endpoints of the hero gradient and reports worst-case contrast.
It then recommends primary/secondary/muted text colors that meet WCAG ratios.
"""
import math

def hex_to_rgb(hexstr):
    hs = hexstr.lstrip('#')
    return tuple(int(hs[i:i+2], 16) for i in (0,2,4))

def srgb_channel_to_linear(c):
    c = c / 255.0
    if c <= 0.03928:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4

def relative_luminance(rgb):
    r,g,b = rgb
    R = srgb_channel_to_linear(r)
    G = srgb_channel_to_linear(g)
    B = srgb_channel_to_linear(b)
    return 0.2126 * R + 0.7152 * G + 0.0722 * B

def contrast_ratio(rgb1, rgb2):
    L1 = relative_luminance(rgb1)
    L2 = relative_luminance(rgb2)
    lighter = max(L1,L2)
    darker = min(L1,L2)
    return (lighter + 0.05) / (darker + 0.05)

def composite_over(bg_rgb, fg_rgb, alpha):
    return tuple(round(alpha * fg + (1-alpha) * bg) for fg,bg in zip(fg_rgb, bg_rgb))

def format_ratio(r):
    return f"{r:.2f}:1"

def main():
    # Gradient endpoints from index.css
    endpoints = {
        'start': '#6b21a8',
        'end': '#4338ca'
    }

    candidates = [
        ('white', '#ffffff', 1.0),
        ('off-white', '#f3f4f6', 1.0),
        ('soft-white', '#e6e6f0', 1.0),
        ('light-yellow', '#fffbeb', 1.0),
        ('black', '#000000', 1.0),
        ('white-92%', '#ffffff', 0.92),
        ('white-78%', '#ffffff', 0.78),
        ('white-60%', '#ffffff', 0.60),
    ]

    print('Contrast analysis vs gradient endpoints (worst-case shown)')
    print('-'*68)
    results = []
    for name, hexc, alpha in candidates:
        fg_rgb = hex_to_rgb(hexc)
        worst_ratio = 999
        worst_end = None
        for ep_name, ep_hex in endpoints.items():
            bg_rgb = hex_to_rgb(ep_hex)
            if alpha < 1.0:
                comp = composite_over(bg_rgb, fg_rgb, alpha)
                ratio = contrast_ratio(comp, bg_rgb)
            else:
                ratio = contrast_ratio(fg_rgb, bg_rgb)
            if ratio < worst_ratio:
                worst_ratio = ratio
                worst_end = ep_name
        results.append((name, hexc, alpha, worst_ratio, worst_end))

    # Print table
    print(f"{'name':<14}{'color':<10}{'alpha':<8}{'worst-contrast':<16}{'against'}")
    for r in results:
        print(f"{r[0]:<14}{r[1]:<10}{r[2]:<8}{format_ratio(r[3]):<16}{r[4]}")

    # Choose recommendations
    # Primary: any candidate with worst_ratio >= 4.5 (WCAG AA normal text)
    primary = [r for r in results if r[3] >= 4.5]
    if primary:
        # prefer fully opaque white-like colors at top
        recommended_primary = primary[0]
    else:
        # fallback to white
        recommended_primary = ('white-fallback','#ffffff',1.0,results[0][3],results[0][4])

    # Secondary: >=3.0 (large text) or best available
    secondary = sorted(results, key=lambda x: -x[3])
    recommended_secondary = secondary[1] if len(secondary) > 1 else secondary[0]

    print('\nRecommendations (worst-case contrast shown):')
    print(f"Primary text -> {recommended_primary[0]} {recommended_primary[1]} alpha={recommended_primary[2]} worst={format_ratio(recommended_primary[3])}")
    print(f"Secondary text -> {recommended_secondary[0]} {recommended_secondary[1]} alpha={recommended_secondary[2]} worst={format_ratio(recommended_secondary[3])}")

if __name__ == '__main__':
    main()
