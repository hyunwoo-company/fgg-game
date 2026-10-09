import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/game_provider.dart';
import '../game/models/game_state.dart';
import 'game_screen.dart';

class RoomScreen extends ConsumerStatefulWidget {
  final String roomId;
  const RoomScreen({super.key, required this.roomId});

  @override
  ConsumerState<RoomScreen> createState() => _RoomScreenState();
}

class _RoomScreenState extends ConsumerState<RoomScreen> {
  @override
  void initState() {
    super.initState();
    _registerSocketListeners();
  }

  void _registerSocketListeners() {
    final socket = ref.read(socketServiceProvider);
    socket.on('room:updated', (data) {
      ref.read(roomInfoProvider.notifier).state =
          RoomInfo.fromJson((data as Map)['room'].cast<String, dynamic>());
    });
    socket.on('game:started', (data) {
      final state = GameState.fromJson((data as Map).cast<String, dynamic>());
      ref.read(gameStateProvider.notifier).state = state;
    });
  }

  @override
  void dispose() {
    final socket = ref.read(socketServiceProvider);
    socket.off('room:updated');
    socket.off('game:started');
    super.dispose();
  }

  void _startGame() {
    ref.read(socketServiceProvider).emit('game:start', {'roomId': widget.roomId});
  }

  @override
  Widget build(BuildContext context) {
    final room = ref.watch(roomInfoProvider);
    final myInfo = ref.watch(myInfoProvider);
    final gameState = ref.watch(gameStateProvider);

    if (gameState != null && (gameState.phase == GamePhase.playing || gameState.phase == GamePhase.scoring)) {
      return const GameScreen();
    }

    final isHost = room?.players.isNotEmpty == true && room!.players[0]['id'] == myInfo?.id;
    final canStart = (room?.playerCount ?? 0) >= 3;

    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: Center(
        child: Container(
          width: 360,
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(color: const Color(0xFF1F2937), borderRadius: BorderRadius.circular(20)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('FGG', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 4),
              const Text('대기실', style: TextStyle(color: Color(0xFF9CA3AF))),
              const SizedBox(height: 28),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('방 코드', style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
              ),
              const SizedBox(height: 6),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: widget.roomId));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('방 코드 복사됨'), duration: Duration(seconds: 1)),
                  );
                },
                child: Text(
                  widget.roomId,
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF60A5FA), letterSpacing: 6),
                ),
              ),
              const SizedBox(height: 4),
              const Text('탭하면 복사됩니다', style: TextStyle(fontSize: 11, color: Color(0xFF4B5563))),
              const SizedBox(height: 24),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('참가자 (${room?.playerCount ?? 0}/5)', style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
              ),
              const SizedBox(height: 8),
              if (room != null)
                ...room.players.asMap().entries.map((e) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          if (e.key == 0) const Text('방장 ', style: TextStyle(fontSize: 12, color: Color(0xFFFBBF24))),
                          Text(
                            e.value['name'] as String,
                            style: TextStyle(
                              color: e.value['id'] == myInfo?.id ? Colors.white : const Color(0xFFD1D5DB),
                              fontWeight: e.value['id'] == myInfo?.id ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    )),
              const SizedBox(height: 28),
              if (isHost)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: canStart ? _startGame : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      disabledBackgroundColor: const Color(0xFF374151),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      canStart ? '게임 시작' : '최소 3명 필요 (현재 ${room.playerCount}명)',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                )
              else
                const Text('방장이 게임을 시작할 때까지 기다려 주세요', style: TextStyle(color: Color(0xFF6B7280), fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}
