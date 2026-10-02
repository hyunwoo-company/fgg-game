import 'package:flutter/material.dart';
import '../game/constants.dart';
import '../game/models/tile.dart';

const _suitColor = {
  Suit.sun: Color(0xFFEF4444), // 빨강
  Suit.moon: Color(0xFF22C55E), // 초록
  Suit.star: Color(0xFFEAB308), // 노랑
  Suit.cloud: Color(0xFF3B82F6), // 파랑
};

const _suitSymbol = {
  Suit.sun: '☀',
  Suit.moon: '☽',
  Suit.star: '★',
  Suit.cloud: '☁',
};

const _suitTextColor = {
  Suit.sun: Colors.white,
  Suit.moon: Colors.white,
  Suit.star: Color(0xFF1F2937), // 노랑 배경에는 어두운 텍스트
  Suit.cloud: Colors.white,
};

class TileWidget extends StatelessWidget {
  final Tile tile;
  final bool isSelected;
  final VoidCallback? onTap;
  final double width;
  final double height;

  const TileWidget({
    super.key,
    required this.tile,
    this.isSelected = false,
    this.onTap,
    this.width = 52,
    this.height = 72,
  });

  @override
  Widget build(BuildContext context) {
    final color = _suitColor[tile.suit]!;
    final textColor = _suitTextColor[tile.suit]!;
    final symbol = _suitSymbol[tile.suit]!;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      transform: Matrix4.translationValues(0, isSelected ? -16 : 0, 0),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? Colors.white : color.withValues(alpha: 0.7),
              width: isSelected ? 2.5 : 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(symbol, style: TextStyle(fontSize: 18, color: textColor)),
              Text(
                suitLabel[tile.suit]!,
                style: TextStyle(fontSize: 10, color: textColor),
              ),
              Text(
                '${tile.number}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TileBackWidget extends StatelessWidget {
  final double width;
  final double height;

  const TileBackWidget({super.key, this.width = 36, this.height = 52});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFF374151),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFF4B5563), width: 1.5),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 3),
        ],
      ),
    );
  }
}
