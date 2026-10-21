"""
Legend Never Dies - Simple Python version
Requires: pygame (pip install pygame)

Controls:
  WASD or Arrow Keys → Move
  Mouse → Aim
  Left Click → Shoot
"""

import pygame
import math
import random
import sys

# Initialize
pygame.init()
WIDTH, HEIGHT = 900, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Legend Never Dies - Hadi")
clock = pygame.time.Clock()

# Colors
BLACK = (10, 10, 10)
DARK = (17, 17, 17)
RED = (196, 30, 58)
DARK_RED = (160, 24, 48)
YELLOW = (255, 204, 0)
GRAY = (85, 85, 85)
WHITE = (255, 255, 255)

# Player
player = {
    "x": WIDTH // 2,
    "y": HEIGHT // 2,
    "speed": 4.5,
    "health": 100,
    "radius": 18
}

bullets = []
enemies = []
score = 0
game_over = False
spawn_timer = 0
spawn_rate = 90

font = pygame.font.SysFont("segoeui", 24)
big_font = pygame.font.SysFont("segoeui", 48, bold=True)
small_font = pygame.font.SysFont("segoeui", 18)

def draw_player(surface, x, y, angle):
    # Simple fighting figure
    # Body
    body_rect = pygame.Rect(0, 0, 16, 28)
    body_rect.center = (x, y)
    pygame.draw.ellipse(surface, RED, body_rect)

    # Head
    pygame.draw.circle(surface, RED, (x, y - 22), 10)

    # Gun arm
    gun_end_x = x + math.cos(angle) * 28
    gun_end_y = y + math.sin(angle) * 28
    pygame.draw.line(surface, DARK_RED, (x, y), (gun_end_x, gun_end_y), 6)
    pygame.draw.line(surface, (30, 30, 30), (x + math.cos(angle)*18, y + math.sin(angle)*18), (gun_end_x, gun_end_y), 4)

    # Legs
    pygame.draw.line(surface, DARK_RED, (x - 5, y + 12), (x - 8, y + 26), 4)
    pygame.draw.line(surface, DARK_RED, (x + 5, y + 12), (x + 8, y + 26), 4)

def spawn_enemy():
    side = random.randint(0, 3)
    if side == 0:
        x, y = random.randint(0, WIDTH), -30
    elif side == 1:
        x, y = WIDTH + 30, random.randint(0, HEIGHT)
    elif side == 2:
        x, y = random.randint(0, WIDTH), HEIGHT + 30
    else:
        x, y = -30, random.randint(0, HEIGHT)

    enemies.append({
        "x": x,
        "y": y,
        "radius": random.randint(14, 22),
        "speed": random.uniform(1.5, 2.8)
    })

def reset_game():
    global score, game_over, spawn_rate, bullets, enemies
    player["x"] = WIDTH // 2
    player["y"] = HEIGHT // 2
    player["health"] = 100
    bullets = []
    enemies = []
    score = 0
    spawn_rate = 90
    game_over = False

# Main loop
running = True
while running:
    clock.tick(60)
    mouse_pos = pygame.mouse.get_pos()
    keys = pygame.key.get_pressed()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if game_over:
                reset_game()
            else:
                # Shoot
                angle = math.atan2(mouse_pos[1] - player["y"], mouse_pos[0] - player["x"])
                bullets.append({
                    "x": player["x"],
                    "y": player["y"],
                    "vx": math.cos(angle) * 12,
                    "vy": math.sin(angle) * 12,
                    "radius": 5
                })

    if not game_over:
        # Movement
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            player["y"] -= player["speed"]
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            player["y"] += player["speed"]
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            player["x"] -= player["speed"]
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            player["x"] += player["speed"]

        # Keep inside
        player["x"] = max(20, min(WIDTH - 20, player["x"]))
        player["y"] = max(20, min(HEIGHT - 20, player["y"]))

        # Update bullets
        for b in bullets[:]:
            b["x"] += b["vx"]
            b["y"] += b["vy"]
            if b["x"] < 0 or b["x"] > WIDTH or b["y"] < 0 or b["y"] > HEIGHT:
                bullets.remove(b)

        # Update enemies
        for e in enemies[:]:
            angle = math.atan2(player["y"] - e["y"], player["x"] - e["x"])
            e["x"] += math.cos(angle) * e["speed"]
            e["y"] += math.sin(angle) * e["speed"]

            # Hit player
            dist = math.hypot(player["x"] - e["x"], player["y"] - e["y"])
            if dist < 22 + e["radius"]:
                player["health"] -= 12
                enemies.remove(e)
                if player["health"] <= 0:
                    player["health"] = 0
                    game_over = True

        # Bullet vs Enemy
        for e in enemies[:]:
            for b in bullets[:]:
                dist = math.hypot(e["x"] - b["x"], e["y"] - b["y"])
                if dist < e["radius"] + b["radius"]:
                    if e in enemies:
                        enemies.remove(e)
                    if b in bullets:
                        bullets.remove(b)
                    score += 10
                    break

        # Spawn
        spawn_timer += 1
        if spawn_timer > spawn_rate:
            spawn_enemy()
            spawn_timer = 0
            if spawn_rate > 35:
                spawn_rate -= 0.7

    # Draw
    screen.fill(DARK)

    # Grid
    for x in range(0, WIDTH, 40):
        pygame.draw.line(screen, (26, 26, 26), (x, 0), (x, HEIGHT))
    for y in range(0, HEIGHT, 40):
        pygame.draw.line(screen, (26, 26, 26), (0, y), (WIDTH, y))

    # Bullets
    for b in bullets:
        pygame.draw.circle(screen, YELLOW, (int(b["x"]), int(b["y"])), b["radius"])

    # Enemies
    for e in enemies:
        pygame.draw.circle(screen, GRAY, (int(e["x"]), int(e["y"])), e["radius"])
        pygame.draw.circle(screen, (136, 136, 136), (int(e["x"]), int(e["y"])), e["radius"], 2)

    # Player
    angle = math.atan2(mouse_pos[1] - player["y"], mouse_pos[0] - player["x"])
    draw_player(screen, player["x"], player["y"], angle)

    # Aim line
    if not game_over:
        pygame.draw.line(screen, (196, 30, 58, 80), (player["x"], player["y"]), mouse_pos, 1)

    # UI
    score_text = font.render(f"Score: {score}", True, WHITE)
    health_text = font.render(f"Health: {max(0, int(player['health']))}", True, WHITE)
    title_text = font.render("LEGEND NEVER DIES", True, RED)

    screen.blit(title_text, (15, 12))
    screen.blit(score_text, (15, 42))
    screen.blit(health_text, (15, 70))

    if game_over:
        over_text = big_font.render("LEGEND NEVER DIES", True, RED)
        restart_text = small_font.render("Click to Restart", True, WHITE)
        screen.blit(over_text, (WIDTH//2 - over_text.get_width()//2, HEIGHT//2 - 40))
        screen.blit(restart_text, (WIDTH//2 - restart_text.get_width()//2, HEIGHT//2 + 20))

    pygame.display.flip()

pygame.quit()
sys.exit()
