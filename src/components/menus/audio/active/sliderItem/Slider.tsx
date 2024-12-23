import { bind } from 'astal';
import { Gdk, Gtk } from 'astal/gtk3';
import AstalWp from 'gi://AstalWp?version=0.1';
import { capitalizeFirstLetter } from 'src/lib/utils';
import options from 'src/options';

const { raiseMaximumVolume } = options.menus.volume;

export const Slider = ({ device, type }: SliderProps): JSX.Element => {
    return (
        <box vertical>
            <label
                className={`menu-active ${type}`}
                halign={Gtk.Align.START}
                truncate
                hexpand
                wrap
                label={bind(device, 'description').as((description) =>
                    capitalizeFirstLetter(description ?? `Unknown ${type} Device`),
                )}
            />
            <slider
                value={bind(device, 'volume')}
                className={`menu-active-slider menu-slider ${type}`}
                drawValue={false}
                hexpand
                min={0}
                max={type === 'playback' ? bind(raiseMaximumVolume).as((raise) => (raise ? 1.5 : 1)) : 1}
                onDragged={({ value, dragging }) => {
                    if (dragging) {
                        device.volume = value;
                        device.mute = false;
                    }
                }}
                setup={(self) => {
                    self.connect('scroll-event', (_, event: Gdk.Event) => {
                        const [directionSuccess, direction] = event.get_scroll_direction();
                        const [deltasSuccess, , yScroll] = event.get_scroll_deltas();

                        if (directionSuccess) {
                            const newVolume = device.volume + (direction === Gdk.ScrollDirection.DOWN ? 0.05 : -0.05);
                            device.set_volume(Math.min(newVolume, 1));
                        } else if (deltasSuccess) {
                            const newVolume = device.volume - yScroll / 100;
                            device.set_volume(Math.min(newVolume, 1));
                        }
                    });
                }}
            />
        </box>
    );
};

interface SliderProps {
    device: AstalWp.Endpoint;
    type: 'playback' | 'input';
}