import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/game_provider.dart';


class LobbyScreen extends ConsumerStatefulWidget {
  const LobbyScreen({super.key});

  @override
  ConsumerState<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends ConsumerState<LobbyScreen> {
  final _nameController = TextEditingController();
  final _codeController = TextEditingController();
  bool _showJoin = false;
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _createRoom() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;
    setState(() => _loading = true);

    final socket = ref.read(socketServiceProvider);
    socket.connect();

    socket.on('room:created', (data) {
      socket.off('room:created');
      socket.off('room:error');
      final roomId = (data as Map)['roomId'] as String;
      ref.read(myInfoProvider.notifier).state = MyInfo(id: socket.id!, name: name, roomId: roomId);
      ref.read(roomInfoProvider.notifier).state = RoomInfo.fromJson((data['room'] as Map).cast());
      if (mounted) context.go('/room/$roomId');
    });

    socket.on('room:error', (data) {
      socket.off('room:created');
      socket.off('room:error');
      ref.read(errorProvider.notifier).state = (data as Map)['reason'] as String;
      setState(() => _loading = false);
    });

    socket.emit('room:create', {'playerName': name});
  }

  void _joinRoom() {
    final name = _nameController.text.trim();
    final code = _codeController.text.trim().toUpperCase();
    if (name.isEmpty || code.isEmpty) return;
    setState(() => _loading = true);

    final socket = ref.read(socketServiceProvider);
    socket.connect();

    socket.on('room:joined', (data) {
      socket.off('room:joined');
      socket.off('room:error');
      final roomId = (data as Map)['roomId'] as String;
      ref.read(myInfoProvider.notifier).state = MyInfo(id: socket.id!, name: name, roomId: roomId);
      ref.read(roomInfoProvider.notifier).state = RoomInfo.fromJson((data['room'] as Map).cast());
      if (mounted) context.go('/room/$roomId');
    });

    socket.on('room:error', (data) {
      socket.off('room:joined');
      socket.off('room:error');
      ref.read(errorProvider.notifier).state = (data as Map)['reason'] as String;
      setState(() => _loading = false);
    });

    socket.emit('room:join', {'roomId': code, 'playerName': name});
  }

  @override
  Widget build(BuildContext context) {
    final error = ref.watch(errorProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('FGG', style: TextStyle(fontSize: 56, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 4)),
              const SizedBox(height: 6),
              const Text('마작 타일 × 포커 족보 클라이밍 게임', style: TextStyle(color: Color(0xFF9CA3AF))),
              const SizedBox(height: 40),
              Container(
                width: 340,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(color: const Color(0xFF1F2937), borderRadius: BorderRadius.circular(20)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _label('닉네임'),
                    const SizedBox(height: 6),
                    _input(_nameController, '이름 입력...', maxLength: 12),
                    if (_showJoin) ...[
                      const SizedBox(height: 16),
                      _label('방 코드'),
                      const SizedBox(height: 6),
                      _input(_codeController, '6자리 코드...', maxLength: 6, center: true),
                    ],
                    const SizedBox(height: 24),
                    if (!_showJoin)
                      _btn('방 만들기', const Color(0xFF2563EB), _loading ? null : _createRoom),
                    if (_showJoin)
                      _btn('입장하기', const Color(0xFF2563EB), _loading ? null : _joinRoom),
                    const SizedBox(height: 10),
                    if (!_showJoin)
                      _btn('방 입장', const Color(0xFF374151), () => setState(() => _showJoin = true)),
                    if (_showJoin)
                      TextButton(
                        onPressed: () => setState(() { _showJoin = false; _loading = false; }),
                        child: const Text('돌아가기', style: TextStyle(color: Color(0xFF6B7280))),
                      ),
                    if (error != null) ...[
                      const SizedBox(height: 12),
                      Text(error, style: const TextStyle(color: Color(0xFFF87171), fontSize: 13), textAlign: TextAlign.center),
                      TextButton(
                        onPressed: () => ref.read(errorProvider.notifier).state = null,
                        child: const Text('닫기', style: TextStyle(color: Color(0xFF9CA3AF))),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Text('3~5명 플레이 · 온라인 멀티플레이', style: TextStyle(fontSize: 12, color: Color(0xFF4B5563))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _label(String text) =>
      Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)));

  Widget _input(TextEditingController ctrl, String hint, {int? maxLength, bool center = false}) =>
      TextField(
        controller: ctrl,
        maxLength: maxLength,
        textAlign: center ? TextAlign.center : TextAlign.start,
        style: TextStyle(color: Colors.white, fontSize: center ? 20 : 16, fontWeight: center ? FontWeight.bold : FontWeight.normal, letterSpacing: center ? 4 : 0),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF6B7280)),
          filled: true,
          fillColor: const Color(0xFF374151),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          counterText: '',
        ),
      );

  Widget _btn(String label, Color color, VoidCallback? onTap) =>
      ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          disabledBackgroundColor: const Color(0xFF374151),
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      );
}
