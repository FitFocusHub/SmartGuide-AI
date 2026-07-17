import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from auto_start import AutoStartup
from smartguide_service import OverlayChatbox


def main():
    if not AutoStartup.is_enabled():
        AutoStartup.enable_startup()
    
    app = OverlayChatbox()
    app.run()


if __name__ == "__main__":
    main()
