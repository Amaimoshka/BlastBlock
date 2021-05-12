import { Position } from "./position.js";

export class Canvas{

    create () {
        this.cols_ = 0;
        this.rows_ = 0;
        this.graphics_ = this.add.graphics();

        let cells_ = this.game.field_.fill();
        this.draw_(cells_);
        
        this.input.on('pointerdown', this.onClick_, this);
    }

    draw_(field) { // закрвшиваем поле
        if (!field || !field.length || !field[0].length) {
            return;
        }

        if (this.rows_ !== field.length) {

            this.rows_ = field.length;
        }

        if (this.cols_ !== field[0].length) {

            this.cols_ = field[0].length;
        }

        

        for (let x = 0; x < this.rows_; x++) {
            for (let y = 0; y < this.cols_; y++) {
                this.drawTile_(field[x][y]);
            }
        }
    }

    drawTile_(field) {// закрашиваем один тайл
        if (!field) return;
        let coords = this.getCoordsByPosit_(field.position);
        this.graphics_.fillStyle(field.color);
        this.graphics_.fillRoundedRect(coords.x + 1, coords.y + 1, this.game.field_.tile.width - 2, this.game.field_.tile.height - 2, 7);

        //--- Прорисовка для всех возможных вариантов ---
    }

    getCoordsByPosit_(posit) {// координаты верхнего правого угла тайла
        let x = posit.x * this.game.field_.tile.width;
        let y = posit.y * this.game.field_.tile.height;
        return new Position(x, y);
    }

    getPositByCoords_(coords) {
        let x = Math.floor(coords.x / this.game.field_.tile.width);
        let y = Math.floor(coords.y / this.game.field_.tile.height);
        return new Position(x, y);
    }

    onClick_(context) {//передает позицию тайла при клике
        let position = this.getPositByCoords_(new Position(context.worldX, context.worldY));
        let neightbors = this.game.field_.onClick(position);
        if (neightbors) {
            this.burn_(neightbors, () => {
                neightbors.forEach((posit) => {
                    this.game.field_.cells[posit.x][posit.y] = null;
                })  
                this.graphics_.clear();
                this.draw_(this.game.field_.cells); 
                let cells = this.game.field_.move();
                this.move_(cells);

            });         
        }
    }

    burn_(posits, callback) {
        let width = this.game.field_.tile.width;
        let height = this.game.field_.tile.height;
        let graphics = this.graphics_;
        let canvas = this;

        this.tweens.addCounter({
            from: 1,
            to: Math.min(width, height) / 2 - 4,
            duration: 900,
            onUpdate: function (tween) {
                let t = tween.getValue();

                graphics.clear();
                canvas.draw_(canvas.game.field_.cells);
                posits.forEach((posit) => {
                    let coords = canvas.getCoordsByPosit_(posit);

                    graphics.fillStyle(0x2d2d2d);
                    graphics.fillRoundedRect(coords.x + 1, coords.y + 1, width - 2, height - 2, 7);

                    graphics.fillStyle(canvas.game.field_.cells[posit.x][posit.y].color);
                    graphics.fillRoundedRect(
                        coords.x + t, 
                        coords.y + t, 
                        width - t * 2,
                        height - t * 2, 
                        7
                    );
                })
            }
        })

        setTimeout(callback, 1000)
    }

    move_(field) {
        let movingSet = [];
        field.forEach((row, x) => {
            row.forEach((tile, y) => {
                if (!tile || !tile.from) return;
                if ( tile.from.x !== x || tile.from.y !== y ) {
                    movingSet.push(tile);
                }
            })
        })

        this.graphics_.clear();
        this.draw_(this.game.field_.cells);
    }

}
